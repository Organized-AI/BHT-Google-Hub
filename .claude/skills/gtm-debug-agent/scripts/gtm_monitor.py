#!/usr/bin/env python3
"""
GTM Debug Agent - Preview Mode Monitor
Monitors Tags, Variables, Consent, and dataLayer in GTM Preview mode.

This script orchestrates the full monitoring workflow:
1. Connect to GTM Preview
2. Navigate to target URL
3. Execute test actions
4. Capture screenshots at each stage
5. Annotate screenshots with validation results
6. Generate comprehensive report
"""

import asyncio
import json
import os
from datetime import datetime
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from pathlib import Path


@dataclass
class MonitoringResult:
    """Results from a single monitoring capture."""
    timestamp: str
    event_name: str
    screenshot_path: str
    annotated_path: Optional[str] = None
    
    # Monitored data
    tags_fired: List[Dict] = field(default_factory=list)
    tags_not_fired: List[Dict] = field(default_factory=list)
    variables: Dict[str, Any] = field(default_factory=dict)
    consent_state: Dict[str, str] = field(default_factory=dict)
    datalayer_events: List[Dict] = field(default_factory=list)
    
    # Validation
    validations_passed: List[str] = field(default_factory=list)
    validations_failed: List[str] = field(default_factory=list)


@dataclass 
class GTMMonitorConfig:
    """Configuration for GTM monitoring session."""
    container_id: str
    target_url: str
    output_dir: str = "./gtm_debug_output"
    
    # Expected outcomes for validation
    expected_tags: List[str] = field(default_factory=list)
    expected_events: List[str] = field(default_factory=list)
    expected_variables: Dict[str, Any] = field(default_factory=dict)
    expected_consent: Dict[str, str] = field(default_factory=dict)
    
    # Test actions to perform
    actions: List[Dict] = field(default_factory=list)


class GTMPreviewMonitor:
    """
    Monitors GTM Preview mode and captures state across four dimensions:
    - Tags (fired/not fired)
    - Variables (values at each event)
    - Consent (storage permissions)
    - dataLayer (all pushed events)
    """
    
    def __init__(self, config: GTMMonitorConfig):
        self.config = config
        self.results: List[MonitoringResult] = []
        self.output_dir = Path(config.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Screenshot counter
        self.screenshot_count = 0
    
    async def capture_tags(self, page) -> Dict:
        """Capture tag firing status from GTM preview panel."""
        return await page.evaluate('''
            () => {
                const result = {
                    fired: [],
                    notFired: []
                };
                
                // These selectors target the Tag Assistant debug panel
                // May need adjustment based on current GTM interface
                document.querySelectorAll('[data-tag-status="fired"]').forEach(el => {
                    result.fired.push({
                        name: el.querySelector('.tag-name')?.textContent?.trim(),
                        type: el.querySelector('.tag-type')?.textContent?.trim(),
                        trigger: el.querySelector('.trigger-name')?.textContent?.trim(),
                        boundingBox: el.getBoundingClientRect()
                    });
                });
                
                document.querySelectorAll('[data-tag-status="not-fired"]').forEach(el => {
                    result.notFired.push({
                        name: el.querySelector('.tag-name')?.textContent?.trim(),
                        reason: el.querySelector('.blocking-reason')?.textContent?.trim(),
                        boundingBox: el.getBoundingClientRect()
                    });
                });
                
                return result;
            }
        ''')
    
    async def capture_variables(self, page) -> Dict:
        """Capture variable values from GTM preview panel."""
        return await page.evaluate('''
            () => {
                const variables = {};
                
                // Navigate to Variables tab and capture values
                document.querySelectorAll('.variable-item').forEach(el => {
                    const name = el.querySelector('.variable-name')?.textContent?.trim();
                    const value = el.querySelector('.variable-value')?.textContent?.trim();
                    if (name) {
                        variables[name] = {
                            value: value,
                            boundingBox: el.getBoundingClientRect()
                        };
                    }
                });
                
                return variables;
            }
        ''')
    
    async def capture_consent(self, page) -> Dict:
        """Capture consent mode state."""
        return await page.evaluate('''
            () => {
                const consent = {
                    analytics_storage: 'unknown',
                    ad_storage: 'unknown',
                    ad_user_data: 'unknown',
                    ad_personalization: 'unknown',
                    functionality_storage: 'unknown',
                    personalization_storage: 'unknown',
                    security_storage: 'unknown'
                };
                
                // Check dataLayer for consent updates
                if (window.dataLayer) {
                    window.dataLayer.forEach(item => {
                        if (Array.isArray(item) && item[0] === 'consent' && item[1] === 'update') {
                            Object.assign(consent, item[2]);
                        }
                    });
                }
                
                // Also check gtag consent state if available
                if (window.google_tag_data?.ics?.entries) {
                    const entries = window.google_tag_data.ics.entries;
                    Object.keys(consent).forEach(key => {
                        if (entries[key]) {
                            consent[key] = entries[key].granted ? 'granted' : 'denied';
                        }
                    });
                }
                
                return consent;
            }
        ''')
    
    async def capture_datalayer(self, page) -> List[Dict]:
        """Capture full dataLayer contents."""
        return await page.evaluate('''
            () => {
                if (!window.dataLayer) return [];
                
                return window.dataLayer.map((item, index) => ({
                    index: index,
                    event: item.event || null,
                    data: JSON.parse(JSON.stringify(item)),
                    timestamp: new Date().toISOString()
                }));
            }
        ''')
    
    async def take_screenshot(self, page, name: str) -> str:
        """Take screenshot and save to output directory."""
        self.screenshot_count += 1
        filename = f"{self.screenshot_count:03d}_{name}.png"
        filepath = self.output_dir / filename
        
        await page.screenshot(path=str(filepath), full_page=False)
        return str(filepath)
    
    async def capture_full_state(self, page, event_name: str) -> MonitoringResult:
        """Capture complete GTM state and screenshot."""
        timestamp = datetime.now().isoformat()
        
        # Take screenshot
        screenshot_path = await self.take_screenshot(page, event_name)
        
        # Capture all monitored data
        tags = await self.capture_tags(page)
        variables = await self.capture_variables(page)
        consent = await self.capture_consent(page)
        datalayer = await self.capture_datalayer(page)
        
        result = MonitoringResult(
            timestamp=timestamp,
            event_name=event_name,
            screenshot_path=screenshot_path,
            tags_fired=tags.get('fired', []),
            tags_not_fired=tags.get('notFired', []),
            variables=variables,
            consent_state=consent,
            datalayer_events=datalayer
        )
        
        # Validate against expected outcomes
        self._validate_result(result)
        
        self.results.append(result)
        return result
    
    def _validate_result(self, result: MonitoringResult):
        """Validate captured state against expected outcomes."""
        
        # Validate expected tags fired
        fired_names = [t.get('name') for t in result.tags_fired]
        for expected_tag in self.config.expected_tags:
            if expected_tag in fired_names:
                result.validations_passed.append(f"Tag fired: {expected_tag}")
            else:
                result.validations_failed.append(f"Tag NOT fired: {expected_tag}")
        
        # Validate expected events in dataLayer
        event_names = [e.get('event') for e in result.datalayer_events if e.get('event')]
        for expected_event in self.config.expected_events:
            if expected_event in event_names:
                result.validations_passed.append(f"Event found: {expected_event}")
            else:
                result.validations_failed.append(f"Event NOT found: {expected_event}")
        
        # Validate expected variable values
        for var_name, expected_value in self.config.expected_variables.items():
            actual = result.variables.get(var_name, {}).get('value')
            if expected_value == '*' and actual is not None:
                result.validations_passed.append(f"Variable exists: {var_name}")
            elif actual == expected_value:
                result.validations_passed.append(f"Variable matched: {var_name}={actual}")
            else:
                result.validations_failed.append(
                    f"Variable mismatch: {var_name} (expected: {expected_value}, got: {actual})"
                )
        
        # Validate consent state
        for consent_type, expected_state in self.config.expected_consent.items():
            actual_state = result.consent_state.get(consent_type, 'unknown')
            if actual_state == expected_state:
                result.validations_passed.append(f"Consent: {consent_type}={actual_state}")
            else:
                result.validations_failed.append(
                    f"Consent mismatch: {consent_type} (expected: {expected_state}, got: {actual_state})"
                )
    
    async def annotate_screenshot(self, result: MonitoringResult) -> str:
        """Add red arrow annotations to screenshot for successes."""
        from annotate_screenshot import ScreenshotAnnotator
        
        annotator = ScreenshotAnnotator(result.screenshot_path)
        
        # Annotate fired tags
        for tag in result.tags_fired:
            if 'boundingBox' in tag:
                bbox = tag['boundingBox']
                annotator.add_success_arrow(
                    target=(int(bbox['x'] + bbox['width']/2), int(bbox['y'] + bbox['height']/2)),
                    label=f"{tag['name']} fired",
                    direction="left"
                )
        
        # Annotate validated variables
        for var_name in self.config.expected_variables:
            if var_name in result.variables:
                var_data = result.variables[var_name]
                if 'boundingBox' in var_data:
                    bbox = var_data['boundingBox']
                    annotator.add_success_arrow(
                        target=(int(bbox['x'] + bbox['width']/2), int(bbox['y'] + bbox['height']/2)),
                        label=f"{var_name} = {var_data['value']}",
                        direction="right"
                    )
        
        # Save annotated version
        base, ext = os.path.splitext(result.screenshot_path)
        annotated_path = f"{base}_annotated{ext}"
        annotator.save(annotated_path)
        
        result.annotated_path = annotated_path
        return annotated_path
    
    def generate_report(self) -> Dict:
        """Generate comprehensive monitoring report."""
        total_passed = sum(len(r.validations_passed) for r in self.results)
        total_failed = sum(len(r.validations_failed) for r in self.results)
        
        report = {
            "summary": {
                "container_id": self.config.container_id,
                "target_url": self.config.target_url,
                "timestamp": datetime.now().isoformat(),
                "total_captures": len(self.results),
                "validations_passed": total_passed,
                "validations_failed": total_failed,
                "success": total_failed == 0
            },
            "captures": []
        }
        
        for result in self.results:
            capture_data = {
                "event": result.event_name,
                "timestamp": result.timestamp,
                "screenshots": {
                    "original": result.screenshot_path,
                    "annotated": result.annotated_path
                },
                "tags_fired": [t.get('name') for t in result.tags_fired],
                "tags_not_fired": [t.get('name') for t in result.tags_not_fired],
                "consent": result.consent_state,
                "datalayer_events": [e.get('event') for e in result.datalayer_events if e.get('event')],
                "validations": {
                    "passed": result.validations_passed,
                    "failed": result.validations_failed
                }
            }
            report["captures"].append(capture_data)
        
        # Save report to file
        report_path = self.output_dir / "monitoring_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        # Also generate markdown report
        self._generate_markdown_report(report)
        
        return report
    
    def _generate_markdown_report(self, report: Dict):
        """Generate human-readable markdown report."""
        md_lines = [
            f"# GTM Debug Report",
            f"",
            f"**Container:** {report['summary']['container_id']}",
            f"**URL:** {report['summary']['target_url']}",
            f"**Timestamp:** {report['summary']['timestamp']}",
            f"",
            f"## Summary",
            f"",
            f"| Metric | Value |",
            f"|--------|-------|",
            f"| Captures | {report['summary']['total_captures']} |",
            f"| Validations Passed | {report['summary']['validations_passed']} |",
            f"| Validations Failed | {report['summary']['validations_failed']} |",
            f"| Overall Status | {'✅ PASSED' if report['summary']['success'] else '❌ FAILED'} |",
            f"",
        ]
        
        for i, capture in enumerate(report['captures'], 1):
            md_lines.extend([
                f"## Capture {i}: {capture['event']}",
                f"",
                f"**Timestamp:** {capture['timestamp']}",
                f"",
                f"### Tags Fired",
                f"",
            ])
            
            if capture['tags_fired']:
                for tag in capture['tags_fired']:
                    md_lines.append(f"- ✅ {tag}")
            else:
                md_lines.append("- (none)")
            
            md_lines.extend([
                f"",
                f"### Consent State",
                f"",
            ])
            
            for k, v in capture['consent'].items():
                status = "✅" if v == "granted" else "❌" if v == "denied" else "⚠️"
                md_lines.append(f"- {status} {k}: {v}")
            
            md_lines.extend([
                f"",
                f"### dataLayer Events",
                f"",
            ])
            
            for event in capture['datalayer_events']:
                md_lines.append(f"- {event}")
            
            md_lines.extend([
                f"",
                f"### Validation Results",
                f"",
            ])
            
            for passed in capture['validations']['passed']:
                md_lines.append(f"- ✅ {passed}")
            
            for failed in capture['validations']['failed']:
                md_lines.append(f"- ❌ {failed}")
            
            if capture['screenshots']['annotated']:
                md_lines.extend([
                    f"",
                    f"### Screenshot",
                    f"",
                    f"![Annotated Screenshot]({capture['screenshots']['annotated']})",
                    f"",
                ])
        
        # Save markdown report
        md_path = self.output_dir / "monitoring_report.md"
        with open(md_path, 'w') as f:
            f.write('\n'.join(md_lines))


# Example usage
async def run_monitoring_session(config: GTMMonitorConfig):
    """Run a complete GTM monitoring session."""
    monitor = GTMPreviewMonitor(config)
    
    # This would integrate with browser-use MCP or Playwright
    # Placeholder for actual browser automation
    print(f"Starting GTM monitoring for {config.container_id}")
    print(f"Target URL: {config.target_url}")
    print(f"Output directory: {config.output_dir}")
    
    # ... browser automation code would go here ...
    
    return monitor.generate_report()


if __name__ == "__main__":
    # Example configuration
    config = GTMMonitorConfig(
        container_id="GTM-XXXXXXX",
        target_url="https://example.com",
        expected_tags=["GA4 - Page View", "Meta Pixel - PageView"],
        expected_events=["page_view"],
        expected_consent={"analytics_storage": "granted"},
        actions=[
            {"type": "wait", "duration": 2000},
            {"type": "capture", "name": "page_load"}
        ]
    )
    
    print("GTM Preview Monitor initialized")
    print(f"Config: {config}")
