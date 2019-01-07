document.addEventListener("DOMContentLoaded", () => {
  simulator = new EMDSimulator({});
});


class EMDSimulator extends Simulator {
  get levelCaps() {
    return [
      [0, 99]
    ];
  }

  get retireBonuses() {
    return [];
  }

  init() {
    this.setLevelCaps();
    this.setRetireLevels();
    this.setClasses(false);
  }

  get class() {
    return this.classes[this._class] || "None";
  }
  set class(value) {
    const old = this.class;
    if (old !== "None") old.resetSkillLevels();

    this._class = value === "None" ? "None" : parseInt(value);
    document.getElementById("class-selector-primary").value = value;
    this.createSkillNodes();
    this.updateSkillPoints();
  }

  get subClass() {
    return "None";
  }
  set subClass(value) {}

  generateSaveData() {
    const length = 2 + this.class.skills.length;
    const view = new Uint8Array(length);

    let currentPos = 0;

    view[currentPos++] = this._class + 1;
    view[currentPos++] = this._currentLevel;

    for (const skill of this.class.skills) view[currentPos++] = skill.level;

    const saveData = btoa(String.fromCharCode(...view));

    return LZString.compressToEncodedURIComponent(saveData);
  }

  loadSaveData(queryString) {
    const saveData = LZString.decompressFromEncodedURIComponent(queryString);
    const view = Uint8Array.from(atob(saveData), c => c.charCodeAt(0));

    let currentPos = 0;
    this.levelCap = 0;
    this.retireLevel = 0;
    this.class = view[currentPos++] - 1;
    this.currentLevel = view[currentPos++];

    for (const skill of this.class.skills) skill.level = view[currentPos++];
  }
}