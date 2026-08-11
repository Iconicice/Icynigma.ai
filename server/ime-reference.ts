export const IME_OFFICIAL_SOURCE_URL = "https://icemediaent-kbysc8ud.manus.space/";

export const IME_OFFICIAL_FACTS = [
  "The designated official website identifies the organization as Ice Media Entertainment (I.M.E.) and describes it as 'Next Gen Audio Production.'",
  "Its published services include remote production and mixing, custom I.M.E. beats, and on-site studio recording; the website says on-site recording is currently paused while the facility is upgraded.",
  "The official site says I.M.E. was founded by Inolofatseng G. Mokgoko, known as Icynigma and Iconic.ice, and describes him as a COO, artist, and forward-thinker.",
  "The site presents I.M.E.'s stated focus as building long-lasting foundations for artists while respecting old-school music-making and developing future-facing production work.",
] as const;

const imeReferencePattern = /(?:\b(?:ice|iconic)\s*media\s*entertainment\b|\bi\.?\s*m\.?\s*e\.?\b|\biconic\.?ice\b|\binolofatseng\b|\bmokgoko\b)/i;

export function isOfficialImeQuestion(message: string) {
  return imeReferencePattern.test(message);
}

export function getOfficialImeReference(message: string) {
  if (!isOfficialImeQuestion(message)) return null;

  return [
    "OFFICIAL I.M.E. REFERENCE — use this only for questions about Ice/Iconic Media Entertainment, I.M.E., Iconic.ice, or Inolofatseng Mokgoko.",
    ...IME_OFFICIAL_FACTS.map((fact) => `- ${fact}`),
    `Source: ${IME_OFFICIAL_SOURCE_URL}`,
    "Answer from these published facts only. Do not invent biography, services, credentials, links, prices, affiliations, or private details. If the requested detail is not listed, say it is not confirmed by the designated official source. Include the source URL in the response.",
  ].join("\n");
}
