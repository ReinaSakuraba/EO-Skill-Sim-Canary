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

  get subClassPenalty() {
    return 2;
  }

  init() {
    this.setLevelCaps();
    this.setRetireLevels();
    this.setClasses();
    Simulator.loadSaveSlots();
  }

  get class() {
    return this.classes[this._class] || null;
  }
  set class(value) {
    const old = this.class;
    if (old) old.resetSkillLevels();

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
    const old = this._vampire;
    if (old === value) return;

    const forceSkills = this.class._forceSkills;

    this._vampire = value;
    this.class.vampire = value;

    document.getElementById("vampire-icon").classList.remove("grayscale");
    if (!value) document.getElementById("vampire-icon").classList.add("grayscale");


    for (const i of [0, 1]) {
      const forceSkill = this.class.skills[i];
      const forceSkillNode = document.getElementById(`skill-${forceSkills[i]}`);
      forceSkillNode.children[0].textContent = forceSkill.name;
      forceSkillNode.id = `skill-${forceSkill.id}`;
    }
  }

  setDefault() {
    this.class = 0;
    this.subClass = null;
    this.levelCap = 0;
    this.currentLevel = 1;
    this.retireLevel = 0;
    this.vampire = false;
  }

  createSkillNodes(primary=true) {
    super.createSkillNodes(primary);

    if (!primary) return;

    const section = primary ? "primary" : "secondary";
    const sectionLayer = document.getElementById(`tree-${section}`);

    const vampireIcon = document.createElement("img");
    vampireIcon.style.position = "absolute";
    vampireIcon.style.left = `${horizontalBuffer + nodeWidth + horizontalPadding / 2 - 10}px`;
    vampireIcon.style.top = `${nodeBorder}px`;
    vampireIcon.src = "../resources/eox-vamp.png";
    if (!this.vampire) vampireIcon.classList.add("grayscale");
    vampireIcon.id = "vampire-icon";
    sectionLayer.appendChild(vampireIcon);

    document.getElementById("vampire-icon").addEventListener("click", () => {
      this.vampire = !this.vampire;
      this.updateURI();
    });
  }

  get additionalSaveLength() {
    return 1;
  }

  generateAdditionalSaveData(view, currentPos) {
    view[currentPos++] = +this._vampire;
    return [view, currentPos];
  }

  loadAdditionalSaveData(view, currentPos) {
    this.vampire = !!view[currentPos++];
    return [view, currentPos];
  }

  additionalSaveText() {
    return `Vampire: ${this.vampire ? "Yes" : "No"}`;
  }
}
