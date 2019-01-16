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
    return this.classes[this._class] || null;
  }
  set class(value) {
    const old = this.class;
    if (old) old.resetSkillLevels();

    this._class = value;
    document.getElementById("class-selector-primary").value = value;
    this.createSkillNodes();
    this.updateSkillPoints();
  }

  get subClass() {
    return null;
  }
  set subClass(value) {}
}
