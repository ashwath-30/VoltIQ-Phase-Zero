export type DoeCategory = "hvac" | "envelope" | "water_heating" | "appliance";

export interface DoeFact {
  id: string;
  title: string;
  category: DoeCategory;
  /**
   * The savings figure, paraphrased faithfully from the source — never
   * copy-pasted verbatim wording, since that's good practice regardless
   * of the fact that government works aren't copyrightable.
   */
  fact: string;
  source: string;
  sourceUrl: string;
  /**
   * Only set when the SOURCE ITSELF frames the figure as a percentage of
   * TOTAL energy costs (not a sub-category like "heating costs" or
   * "water heating costs"). Only in that case is it honest to apply the
   * percentage directly to a user's real total bill — otherwise we'd be
   * fabricating precision the source never claimed. Null means: show
   * the fact as general guidance, don't invent a personalized dollar
   * figure for it.
   */
  percentOfTotalBill: number | null;
}

// Every figure below was verified against a live government source before
// being added here — not pulled from memory. Re-verify periodically, since
// government guidance does get updated over time.
export const DOE_FACTS: DoeFact[] = [
  {
    id: "doe_thermostat_setback",
    title: "Use a thermostat setback schedule",
    category: "hvac",
    fact: "Turning your thermostat back 7-10°F for 8 hours a day — for example, while at work or asleep — can save up to 10% a year on heating and cooling costs.",
    source: "U.S. Department of Energy",
    sourceUrl: "https://www.energy.gov/energysaver/programmable-thermostats",
    percentOfTotalBill: null,
  },
  {
    id: "doe_led_lighting",
    title: "Switch to ENERGY STAR certified LED bulbs",
    category: "appliance",
    fact: "ENERGY STAR certified LEDs use at least 75% less energy and last up to 25 times longer than incandescent bulbs, often saving $40 or more per bulb over its lifetime.",
    source: "U.S. Department of Energy",
    sourceUrl: "https://www.energy.gov/energysaver/articles/led-lighting",
    percentOfTotalBill: null,
  },
  {
    id: "doe_air_sealing",
    title: "Air seal and insulate your home",
    category: "envelope",
    fact: "Sealing air leaks and adding insulation in attics, floors over crawl spaces, and basements saves homeowners an average of 15% on heating and cooling costs — about 11% of total energy costs.",
    source: "U.S. EPA (ENERGY STAR)",
    sourceUrl: "https://www.energystar.gov/saveathome/seal_insulate/why-seal-and-insulate",
    percentOfTotalBill: 11,
  },
  {
    id: "doe_water_heater_temp",
    title: "Lower your water heater temperature to 120°F",
    category: "water_heating",
    fact: "Most water heaters are factory-set to 140°F. Lowering to 120°F is safer for your household and can save 4-22% a year on water heating costs.",
    source: "U.S. Department of Energy",
    sourceUrl: "https://www.energy.gov/node/611861",
    percentOfTotalBill: null,
  },
  {
    id: "doe_refrigerator_upgrade",
    title: "Consider an ENERGY STAR certified refrigerator",
    category: "appliance",
    fact: "ENERGY STAR certified refrigerators are about 9% more efficient than models that just meet the federal minimum standard. Refrigerators over 15 years old can cost more than $80/year to run.",
    source: "U.S. EPA (ENERGY STAR)",
    sourceUrl: "https://www.energystar.gov/products/refrigerators",
    percentOfTotalBill: null,
  },
];

export interface DoeRecommendation extends DoeFact {
  /** Personalized dollar estimate — only present when percentOfTotalBill was set. */
  estimatedMonthlySavings: number | null;
}

/**
 * Turns the static fact list into recommendations, adding a real
 * personalized dollar estimate ONLY where the underlying source figure
 * is honestly applicable to a user's whole bill. Every other fact is
 * still returned — just without a fabricated number attached to it.
 */
export function getDoeRecommendations(avgMonthlyBill: number): DoeRecommendation[] {
  return DOE_FACTS.map((f) => ({
    ...f,
    estimatedMonthlySavings:
      f.percentOfTotalBill != null ? Math.round(avgMonthlyBill * (f.percentOfTotalBill / 100)) : null,
  }));
}
