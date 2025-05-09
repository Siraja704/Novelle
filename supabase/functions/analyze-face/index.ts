import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as tf from "https://esm.sh/@tensorflow/tfjs@4.10.0";
import * as faceapi from "https://esm.sh/face-api.js@0.22.2";

interface RequestBody {
  image: string;
}

interface Point {
  x: number;
  y: number;
}

// Initialize face-api models
const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

serve(async (req: Request) => {
  try {
    const { image } = (await req.json()) as RequestBody;

    // Convert base64 to image
    const img = await faceapi.fetchImage(image);

    // Detect face and landmarks
    const detections = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detections) {
      return new Response(JSON.stringify({ error: "No face detected" }), {
        status: 400,
      });
    }

    // Extract landmarks
    const landmarks = detections.landmarks.positions.map((point: Point) => [
      point.x,
      point.y,
    ]);

    // Determine face shape
    const faceWidth = Math.abs(landmarks[0][0] - landmarks[16][0]);
    const faceHeight = Math.abs(landmarks[8][1] - landmarks[27][1]);
    const jawWidth = Math.abs(landmarks[4][0] - landmarks[12][0]);
    const foreheadWidth = Math.abs(landmarks[17][0] - landmarks[26][0]);

    const ratio = faceHeight / faceWidth;
    const jawRatio = jawWidth / faceWidth;
    const foreheadRatio = foreheadWidth / faceWidth;

    let faceShape = "Oval";
    if (ratio > 1.5) faceShape = "Oblong";
    else if (jawRatio < 0.8) faceShape = "Heart";
    else if (jawRatio > 0.9 && foreheadRatio < 0.8) faceShape = "Round";
    else if (jawRatio > 0.9 && foreheadRatio > 0.9) faceShape = "Square";

    // Get recommendations based on face shape
    const recommendations =
      {
        Oval: [
          "Most hairstyles suit oval faces",
          "Try side-swept bangs",
          "Experiment with different lengths",
        ],
        Round: [
          "Add height to the crown",
          "Try angular cuts",
          "Avoid round styles",
        ],
        Square: [
          "Soft layers work well",
          "Try side parts",
          "Avoid straight bangs",
        ],
        Heart: [
          "Chin-length styles work well",
          "Try side-swept bangs",
          "Avoid styles that add width at the top",
        ],
        Oblong: [
          "Try bangs",
          "Medium-length styles work well",
          "Avoid very long styles",
        ],
      }[faceShape] || [];

    return new Response(
      JSON.stringify({
        faceShape,
        landmarks,
        confidence: detections.detection.score,
        recommendations,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
});
