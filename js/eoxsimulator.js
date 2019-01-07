document.addEventListener("DOMContentLoaded", () => {
  simulator = new EOXSimulator({classClass: EOXClass});
});


class EOXClass extends ForceClass {
  get vampire() {
    return this._vampire;
  }
  set vampire(value) {
    this._vampire = value;

    this._forceSkills = value ? [494, 495] : this._info[2];
  }
}


class EOXSimulator extends Simulator {
  get levelCaps() {
    return [
      [0,  99],
      [1, 109],
      [2, 119],
      [3, 130]
    ];
  }

  get retireBonuses() {
    return [
      [0,     "N/A",  0],
      [1,   "30-39",  3],
      [2,   "60-69",  4],
      [3,   "70-89",  5],
      [4,  "90-119",  6],
      [5, "120-129",  7],
      [6,     "130", 10]
    ];
  }

  get secondaryPenalty() {
    return 2;
  }

  init() {
    this.setLevelCaps();
    this.setRetireLevels();
    this.setClasses();
    document.getElementById("vampire-icon").addEventListener("click", () => {
      this.vampire = !this.vampire;
      this.updateURI();
    });
  }

  get class() {
    return this.classes[this._class] || "None";
  }
  set class(value) {
    const old = this.class;
    if (old !== "None") old.resetSkillLevels();

    this._class = value;
    document.getElementById("class-selector-primary").value = value;
    this.class.vampire = this.vampire;
    this.disableClasses();
    this.createSkillNodes();
    this.updateSkillPoints();
  }

  get vampire() {
    return this._vampire;
  }
  set vampire(value) {
    this._vampire = value;
    document.getElementById("vampire-icon").classList = value ? [] : ["grayscale"];
    this.class.vampire = value;
    this.createSkillNodes();
  }

  setDefault() {
    this.class = 0;
    this.subClass = "None";
    this.levelCap = 0;
    this.currentLevel = 1;
    this.retireLevel = 0;
    this.vampire = false;
  }

  generateSaveData() {
    const hasSub = this._subClass !== "None";

    const length = 6 + this.class.skills.length * (hasSub ? 2 : 1);
    const view = new Uint8Array(length);

    let currentPos = 0;

    view[currentPos++] = this._class + 1;
    view[currentPos++] = hasSub ? this._subClass + 1 : 0;
    view[currentPos++] = this._currentLevel;
    view[currentPos++] = this._levelCap;
    view[currentPos++] = this._retireLevel;
    view[currentPos++] = +this._vampire;

    for (const cls of [this.class, this.subClass]) {
      if (cls === "None") continue;
      for (const skill of cls.skills) view[currentPos++] = skill.level;
    }

    const saveData = btoa(String.fromCharCode(...view));

    return LZString.compressToEncodedURIComponent(saveData);
  }

  loadSaveData(queryString) {
    const saveData = LZString.decompressFromEncodedURIComponent(queryString);
    const view = Uint8Array.from(atob(saveData), c => c.charCodeAt(0));

    let currentPos = 0;

    this.class = view[currentPos++] - 1;
    this.subClass = view[currentPos] === 0 ? "None" : view[currentPos] - 1;
    this.currentLevel = view[++currentPos];
    this.levelCap = view[++currentPos];
    this.retireLevel = view[++currentPos];
    this.vampire = !!view[++currentPos];

    for (const cls of [this.class, this.subClass]) {
      if (cls === "None") continue;
      for (const skill of cls.skills) skill.level = view[++currentPos];
    }
  }
}
