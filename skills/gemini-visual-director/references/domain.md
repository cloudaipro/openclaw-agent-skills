# Gemini Visual Director Domain Notes

## Prompt Strategy
Split outputs into two modes:
- Gemini mode: narrative and iterative, suitable for conversational refinement.
- Imagen mode: direct structured prompt with explicit visual constraints.

## Imagen-Oriented Elements
Always specify:
- Subject identity and action.
- Scene geometry and perspective.
- Lighting setup and material cues.
- Color palette and mood.
- Quality descriptors and composition intent.

## Variant Strategy
Create at least two variants:
- Safe baseline with broad compatibility.
- Stylized variant with stronger aesthetic constraints.

## Trigger Disambiguation
Choose this skill over other creative skills when users explicitly request Gemini or Imagen alignment.
