#!/usr/bin/env python3
"""
GTM Debug Agent - Screenshot Annotator
Adds red arrows and labels to screenshots to highlight validation successes.

Requirements:
    pip install pillow --break-system-packages
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os
from typing import Tuple, List, Optional
from dataclasses import dataclass


@dataclass
class Annotation:
    """Represents a single annotation on the screenshot."""
    arrow_start: Tuple[int, int]  # Tail of arrow
    arrow_end: Tuple[int, int]    # Head of arrow (points to element)
    label: str
    label_position: Optional[Tuple[int, int]] = None  # Auto-calculated if None
    color: Tuple[int, int, int] = (255, 0, 0)  # Red by default
    success: bool = True  # Green checkmark prefix if True


class ScreenshotAnnotator:
    """
    Annotates screenshots with red arrows and labels to highlight
    GTM debug successes (tags fired, variables matched, etc.)
    """
    
    def __init__(self, image_path: str):
        """
        Initialize with a screenshot image.
        
        Args:
            image_path: Path to the screenshot PNG file
        """
        self.image = Image.open(image_path)
        self.draw = ImageDraw.Draw(self.image)
        self.annotations: List[Annotation] = []
        
        # Try to load a nice font, fall back to default
        self.font = self._load_font(16)
        self.small_font = self._load_font(12)
    
    def _load_font(self, size: int) -> ImageFont.FreeTypeFont:
        """Load a font, with fallbacks."""
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
        ]
        
        for path in font_paths:
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except:
                    pass
        
        # Fall back to default
        return ImageFont.load_default()
    
    def add_arrow(
        self,
        start: Tuple[int, int],
        end: Tuple[int, int],
        label: str,
        label_position: Optional[Tuple[int, int]] = None,
        color: Tuple[int, int, int] = (255, 0, 0),
        success: bool = True
    ):
        """
        Add a red arrow annotation pointing to an element.
        
        Args:
            start: (x, y) coordinates for arrow tail
            end: (x, y) coordinates for arrow head (points to target)
            label: Text label to display
            label_position: Optional (x, y) for label, auto-calculated if None
            color: RGB tuple for arrow color (default red)
            success: If True, prefix label with green checkmark
        """
        self.annotations.append(Annotation(
            arrow_start=start,
            arrow_end=end,
            label=label,
            label_position=label_position,
            color=color,
            success=success
        ))
    
    def add_success_arrow(
        self,
        target: Tuple[int, int],
        label: str,
        direction: str = "left"
    ):
        """
        Convenience method to add a success arrow from a direction.
        
        Args:
            target: (x, y) coordinates of the element to highlight
            label: Success message
            direction: "left", "right", "top", or "bottom"
        """
        offset = 80  # Arrow length
        x, y = target
        
        if direction == "left":
            start = (x - offset, y)
        elif direction == "right":
            start = (x + offset, y)
        elif direction == "top":
            start = (x, y - offset)
        else:  # bottom
            start = (x, y + offset)
        
        self.add_arrow(start=start, end=target, label=label, success=True)
    
    def _draw_arrow(self, annotation: Annotation):
        """Draw a single arrow with arrowhead."""
        x1, y1 = annotation.arrow_start
        x2, y2 = annotation.arrow_end
        color = annotation.color
        
        # Draw main line (thick)
        self.draw.line([(x1, y1), (x2, y2)], fill=color, width=3)
        
        # Calculate arrowhead
        angle = math.atan2(y2 - y1, x2 - x1)
        arrow_length = 15
        arrow_angle = math.pi / 6  # 30 degrees
        
        # Arrowhead points
        left_x = x2 - arrow_length * math.cos(angle - arrow_angle)
        left_y = y2 - arrow_length * math.sin(angle - arrow_angle)
        right_x = x2 - arrow_length * math.cos(angle + arrow_angle)
        right_y = y2 - arrow_length * math.sin(angle + arrow_angle)
        
        # Draw filled arrowhead
        self.draw.polygon(
            [(x2, y2), (left_x, left_y), (right_x, right_y)],
            fill=color
        )
    
    def _draw_label(self, annotation: Annotation):
        """Draw label with background box."""
        # Determine label position
        if annotation.label_position:
            label_x, label_y = annotation.label_position
        else:
            # Auto-position near arrow start
            x1, y1 = annotation.arrow_start
            x2, y2 = annotation.arrow_end
            
            # Offset from arrow start
            if x1 < x2:
                label_x = x1 - 10
            else:
                label_x = x1 + 10
            label_y = y1 - 10
        
        # Prepare label text
        if annotation.success:
            text = f"✓ {annotation.label}"
        else:
            text = f"✗ {annotation.label}"
        
        # Get text bounding box
        bbox = self.draw.textbbox((label_x, label_y), text, font=self.font)
        padding = 4
        
        # Draw background rectangle
        bg_color = (255, 255, 255, 230)  # White with transparency
        border_color = annotation.color
        
        self.draw.rectangle(
            [
                bbox[0] - padding,
                bbox[1] - padding,
                bbox[2] + padding,
                bbox[3] + padding
            ],
            fill=(255, 255, 255),
            outline=border_color,
            width=2
        )
        
        # Draw text
        text_color = (0, 150, 0) if annotation.success else (200, 0, 0)
        self.draw.text((label_x, label_y), text, fill=text_color, font=self.font)
    
    def render(self):
        """Render all annotations onto the image."""
        for annotation in self.annotations:
            self._draw_arrow(annotation)
            self._draw_label(annotation)
    
    def save(self, output_path: str):
        """
        Render and save the annotated screenshot.
        
        Args:
            output_path: Path to save the annotated image
        """
        self.render()
        self.image.save(output_path)
        print(f"Saved annotated screenshot: {output_path}")
        return output_path
    
    def get_image(self) -> Image.Image:
        """Return the annotated image object."""
        self.render()
        return self.image


def annotate_gtm_success(
    screenshot_path: str,
    successes: List[dict],
    output_path: Optional[str] = None
) -> str:
    """
    High-level function to annotate a GTM debug screenshot.
    
    Args:
        screenshot_path: Path to original screenshot
        successes: List of success items with coordinates and labels
            Example: [
                {"x": 150, "y": 200, "label": "GA4 Purchase Tag Fired", "direction": "left"},
                {"x": 300, "y": 350, "label": "transaction_id present", "direction": "top"}
            ]
        output_path: Optional output path (auto-generated if None)
    
    Returns:
        Path to the annotated screenshot
    """
    annotator = ScreenshotAnnotator(screenshot_path)
    
    for item in successes:
        annotator.add_success_arrow(
            target=(item["x"], item["y"]),
            label=item["label"],
            direction=item.get("direction", "left")
        )
    
    if output_path is None:
        base, ext = os.path.splitext(screenshot_path)
        output_path = f"{base}_annotated{ext}"
    
    return annotator.save(output_path)


def create_summary_annotation(
    screenshot_path: str,
    results: dict,
    output_path: Optional[str] = None
) -> str:
    """
    Create a summary annotation showing all validation results.
    
    Args:
        screenshot_path: Path to screenshot
        results: Validation results dict with structure:
            {
                "tags": [{"name": "...", "fired": True, "coords": (x, y)}, ...],
                "variables": [{"name": "...", "value": "...", "coords": (x, y)}, ...],
                "consent": {"status": "granted", "coords": (x, y)},
                "dataLayer": [{"event": "...", "coords": (x, y)}, ...]
            }
        output_path: Optional output path
    
    Returns:
        Path to annotated screenshot
    """
    annotator = ScreenshotAnnotator(screenshot_path)
    
    # Annotate tags
    for tag in results.get("tags", []):
        if tag.get("fired") and tag.get("coords"):
            annotator.add_success_arrow(
                target=tag["coords"],
                label=f"{tag['name']} fired",
                direction="left"
            )
    
    # Annotate variables
    for var in results.get("variables", []):
        if var.get("coords"):
            annotator.add_success_arrow(
                target=var["coords"],
                label=f"{var['name']} = {var['value']}",
                direction="right"
            )
    
    # Annotate consent
    consent = results.get("consent", {})
    if consent.get("coords"):
        annotator.add_success_arrow(
            target=consent["coords"],
            label=f"Consent: {consent.get('status', 'unknown')}",
            direction="top"
        )
    
    # Annotate dataLayer events
    for event in results.get("dataLayer", []):
        if event.get("coords"):
            annotator.add_success_arrow(
                target=event["coords"],
                label=f"Event: {event['event']}",
                direction="left"
            )
    
    if output_path is None:
        base, ext = os.path.splitext(screenshot_path)
        output_path = f"{base}_summary{ext}"
    
    return annotator.save(output_path)


# CLI usage
if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 3:
        print("Usage: python annotate_screenshot.py <screenshot.png> <annotations.json>")
        print("")
        print("annotations.json format:")
        print('[{"x": 100, "y": 200, "label": "Success message", "direction": "left"}]')
        sys.exit(1)
    
    screenshot = sys.argv[1]
    annotations_file = sys.argv[2]
    
    with open(annotations_file, 'r') as f:
        annotations = json.load(f)
    
    output = annotate_gtm_success(screenshot, annotations)
    print(f"Created: {output}")
