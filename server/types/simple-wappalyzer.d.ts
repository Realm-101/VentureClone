declare module 'simple-wappalyzer' {
  interface WappalyzerTechnology {
    name: string;
    categories?: string[];
    confidence?: number;
    version?: string;
    website?: string;
    icon?: string;
  }

  class Wappalyzer {
    constructor();
    analyze(url: string): Promise<WappalyzerTechnology[]>;
  }

  export default Wappalyzer;
}
