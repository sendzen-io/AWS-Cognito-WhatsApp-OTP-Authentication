import {logReturn} from "../utils"

const verifyAuthChallenge = async (event: any) => {
  console.log("verifyAuthChallenge:", JSON.stringify(event));

  const { request, response } = event;

  const userAnswer = (request.challengeAnswer || "").trim();
  const correct = request.privateChallengeParameters?.answer || "";
  const issuedAt = Number(request.privateChallengeParameters?.issuedAt || "0");

  // 5 minute expiry
  const ttlMs = 5 * 60 * 1000;
  const now = Date.now();

  if (!issuedAt || now - issuedAt > ttlMs) {
    console.log("otp expired");
    response.answerCorrect = false;
    return logReturn("verify_expired", event);
  }

  if (userAnswer === correct) {
    console.log("otp accepted");
    response.answerCorrect = true;
    return logReturn("verify_ok", event);
  } else {
    console.log("otp rejected");
    response.answerCorrect = false;
    return logReturn("verify_wrong_code", event);
  }
};

export const handler = verifyAuthChallenge;
