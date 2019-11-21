const allStyles = getComputedStyle(document.documentElement);

const nodeWidth = parseInt(allStyles.getPropertyValue("--node-width").trim().slice(0, -2));
const nodeHeight = parseInt(allStyles.getPropertyValue("--node-height").trim().slice(0, -2));
const nodeBorder = parseInt(allStyles.getPropertyValue("--node-border").trim().slice(0, -2));
const horizontalPadding = parseInt(allStyles.getPropertyValue("--node-horizontal-padding").trim().slice(0, -2));
const verticalPadding = parseInt(allStyles.getPropertyValue("--node-vertical-padding").trim().slice(0, -2));

const horizontalBuffer = nodeWidth + horizontalPadding;
const verticalBuffer = nodeHeight + verticalPadding;

const treeWidth = nodeWidth * 6 + horizontalPadding * 5 + nodeBorder * 2;
const treeHeight = nodeHeight * 7 + verticalPadding * 6 + nodeBorder * 2;

let simulator;


window.addEventListener("popstate", () => {
  const query = window.location.search.slice(1);
  history.state || query ? simulator.loadSaveData(history.state || query) : simulator.setDefault();
});


class LevelData {
  constructor(info, skill) {
    this._format = info[0];
    this._levels = info[1];
    this.skill = skill;
  }

  get format() {
    return formats[this._format];
  }

  get name() {
    return this.skill.simulator.getTrans(3, this.format[0]);
  }

  get levels() {
    return this._levels.map(this.format[1]);
  }
}


class Skill {
  constructor(info, simulator) {
    this.id = info[0];
    this.trans = info[1];
    this.coords = {x: info[2], y: info[3]};
    this.requiredLevel = info[4];
    this._maxLevel = info[5];
    this._bodyPart = info[6];
    this._statsUsed = info[7];
    this._weaponsUsed = info[8];
    this._prereqs = info[9];
    this._forwards = info[10];
    //this.levelData = levels[this.trans][1].map(i => new LevelData(i, this));

    this.simulator = simulator;

    this._level = 0;
    this.unique = [0, 1].includes(this._maxLevel);
  }

  get name() {
    return this.simulator.getTrans(1, this.trans);
  }

  get description() {
    return this.simulator.getTrans(2, this.trans);
  }

  get maxLevel() {
    if (!this.simulator.subClass) return this._maxLevel;

    return this._maxLevel / (this.simulator.subClass._skills.includes(this.id) ? this.simulator.subClassPenalty : 1);
  }

  get prereqs() {
    return this._prereqs.map(([skillID, reqLevel]) => [this.simulator.skills[skillID], reqLevel]);
  }

  get forwards() {
    return this._forwards.map(([skillID, reqLevel]) => [this.simulator.skills[skillID], reqLevel]);
  }

  get level() {
    return this._level;
  }

  set level(value) {
    value = Math.min(Math.max(value, 0), this.maxLevel);
    const old = this._level;

    if (old === value) return;

    this._level = value;

    if (value > old) {
      if (this.simulator.currentLevel < this.requiredLevel) this.simulator.currentLevel = this.requiredLevel;

      for (const [skill, reqLevel] of this.prereqs) if (skill.level < reqLevel) skill.level = reqLevel;
    } else {
      for (const [skill, reqLevel] of this.forwards) if (skill.level > 0 && value < reqLevel) skill.level = 0;
    }
    this.simulator.updateNodes();
  }

  get body() {
    const parts = [
      [0, "None"],
      [1, "Head"],
      [2, "Arms"],
      [3, "Legs"]
    ];
    return parts[this._bodyPart][1];
  }

  get stat() {
    const stats = [
      [0, "None"],
      [1, "STR"],
      [2, "INT"],
      [3, "VIT"],
      [4, "WIS"],
      [5, "AGI"],
      [6, "LUC"]
    ];
    return this._statsUsed.map(id => stats[id][1]);
  }

  get weapons() {
    const weapons = [
      [0, "None"],
      [1, "Sword"],
      [2, "Bow"],
      [3, "Katana"],
      [4, "Staff"],
      [5, "Gun"],
      [6, "Spear"],
      [7, "Rapier"],
      [8, "Knife"],
      [9, "Drive Blade"],
      [10, "Cestus"],
      [11, "Scythe"],
      [12, "Shield"]
    ];
    return this._weaponsUsed.map(id => weapons[id][1]);
  }
}


class Class {
  constructor(info, simulator) {
    this._info = info;

    this.id = info[0];
    this.trans = info[1];
    this._skills = info[2];

    this.simulator = simulator;
  }

  get name() {
    return this.simulator.getTrans(4, this.trans);
  }

  get skills() {
    return this._skills.map(skillID => this.simulator.skills[skillID]);
  }

  resetSkillLevels() {
    for (const skill of this.skills) skill.level = 0;
  }
}


class ForceClass extends Class {
  constructor(info, simulator) {
    super(info, simulator);
    this._forceSkills = info[2];
    this._skills = info[3];
  }

  get skills() {
    return this._forceSkills.concat(this._skills).map(skillID => this.simulator.skills[skillID]);
  }
}


class Simulator {
  get levelCaps() {
    return [
      [0, 70],
      [1, 80],
      [2, 90],
      [3, 99]
    ];
  }

  get retireBonuses() {
    return [
      [0,   "N/A",  0],
      [1, "30-39",  4],
      [2, "40-49",  5],
      [3, "50-59",  6],
      [4, "60-69",  7],
      [5, "70-98",  8],
      [6,    "99", 10]
    ];
  }

  get subClassPenalty() {
    return null;
  }

  constructor ({classClass=Class, skillClass=Skill}) {
    if (this.constructor === Simulator) {
      throw new TypeError('Abstract class "Simulator" cannot be instantiated directly.');
    }

    this._levelCap = 0;
    this._retireLevel = 0;

    this.language = 1;
    this.skills = skills.map(v => new skillClass(v, this));
    this.classes = classes.map(v => new classClass(v, this));

    this.buildHeader();
    this.init();

    const query = window.location.search.slice(1);

    query !== "" ? this.loadSaveData(query) : this.setDefault();

    const treeAmount = this.subClassPenalty === null ? 1 : 2;

    document.getElementById("main").style.height = `${treeHeight * treeAmount + verticalBuffer * treeAmount}px`;
    const trees = document.querySelectorAll(".tree");
    for (const tree of trees) {
      tree.style.width = `${treeWidth}px`;
      tree.style.height = `${treeHeight}px`;
    }
    document.body.style.minWidth = `${treeWidth}px`;

    document.getElementById("save-button").addEventListener("click", () => this.saveSave());
    document.getElementById("load-button").addEventListener("click", () => this.loadSave());
    document.getElementById("text-export").addEventListener("click", () => this.exportText());
    document.getElementById("reset-points").addEventListener("click", () => {
      this.class.resetSkillLevels();
      if (this.subClass) this.subClass.resetSkillLevels();
      this.updateURI();
    })
  }

  init() {
    this.setLevelCaps();
    this.setRetireLevels();
    this.setClasses();
    Simulator.loadSaveSlots();
  }

  get currentLevel() {
    return this._currentLevel;
  }
  set currentLevel(value) {
    this._currentLevel = parseInt(value);
    document.getElementById("level").value = value;
    this.updateSkillPoints();
  }

  get levelCap() {
    return this.levelCaps[this._levelCap][1];
  }
  set levelCap(value) {
    if (this.levelCaps.length !== 1) {
      this._levelCap = parseInt(value);
      document.getElementById("level-cap").value = value;
    } else {
      this._levelCap = 0;
    }
    this.setLevels();
  }

  get retireLevel() {
    return this.retireBonuses[this._retireLevel][1];
  }
  set retireLevel(value) {
    if (this.retireBonuses.length !== 0) {
      this._retireLevel = parseInt(value);
      document.getElementById("retire").value = value;
    }
    this.updateSkillPoints();
  }

  get class() {
    return this.classes[this._class] || null;
  }
  set class(value) {
    const old = this.class;
    if (old) old.resetSkillLevels();

    this._class = value;
    document.getElementById("class-selector-primary").value = value;
    this.disableClasses();
    this.createSkillNodes();
    this.updateSkillPoints();
  }

  get subClass() {
    return this.classes[this._subClass] || null;
  }
  set subClass(value) {
    const old = this.subClass;
    if (old) old.resetSkillLevels();

    this._subClass = value;
    document.getElementById("class-selector-secondary").value = value !== null ? value : "None";
    this.disableClasses(false);
    this.createSkillNodes(false);
    this.updateSkillPoints();
  }

  get retireBonus() {
    return this.retireBonuses.length !== 0 ? this.retireBonuses[this._retireLevel][2] : 0;
  }

  get pointsTotal() {
    return 2 + this.currentLevel + (this.subClass ? 5 : 0) + this.retireBonus;
  }

  get pointsCurrent() {
    return this.skills.reduce((prev, skill) => prev + skill.level, 0);
  }

  getTrans(type, index) {
    const types = {
      0: uiTrans,
      1: skillNameTrans,
      2: skillDescTrans,
      3: skillHeaderTrans,
      4: classNameTrans
    };

    const info = types[type];

    return info[index][this.language] || info[index][1];
  }

  setDefault() {
    this.class = 0;
    this.subClass = null;
    this.levelCap = 0;
    this.currentLevel = 1;
    this.retireLevel = 0;
  }

  buildHeader() {
    const canSub = this.subClassPenalty !== null;
    const canUnlockCap = this.levelCaps.length !== 1;
    const canRetire = this.retireBonuses.length !== 0;

    const header = document.getElementById("header");

    const main = document.createElement("div");
    main.id = "header-main";

    const classSection = document.createElement("div");
    classSection.classList.add("thing");

    const classLabel = document.createElement("label");

    const classSpan = document.createElement("span");
    classSpan.textContent = this.getTrans(0, 0); // Class
    classLabel.appendChild(classSpan);

    const classSelector = document.createElement("select");
    classSelector.id = "class-selector-primary";
    classLabel.appendChild(classSelector);

    classSection.appendChild(classLabel);

    if (canSub) {
      const subLabel = document.createElement("label");

      const subSpan = document.createElement("span");
      subSpan.textContent = this.getTrans(0, 1); // Subclass
      subLabel.appendChild(subSpan);

      const subSelector = document.createElement("select");
      subSelector.id = "class-selector-secondary";
      subLabel.appendChild(subSelector);

      classSection.appendChild(subLabel);
    }

    main.appendChild(classSection);

    const levelSection = document.createElement("div");
    levelSection.classList.add("thing");

    const levelLabel = document.createElement("span");

    const levelSpan = document.createElement("span");
    levelSpan.id = "level-span";
    levelSpan.textContent = this.getTrans(0, 2); // Level
    levelLabel.appendChild(levelSpan);

    const levelSelector = document.createElement("select");
    levelSelector.id = "level";
    levelLabel.appendChild(levelSelector);

    levelSection.appendChild(levelLabel);

    if (canUnlockCap) {
      const capLabel = document.createElement("span");

      const capSpan = document.createElement("span");
      capSpan.textContent = "/";
      capLabel.appendChild(capSpan);

      const capSelector = document.createElement("select");
      capSelector.id = "level-cap";
      capLabel.appendChild(capSelector);

      levelSection.appendChild(capLabel);
    }

    if (canRetire) {
      const retireLabel = document.createElement("span");

      const retireSpan = document.createElement("span");
      retireSpan.textContent = this.getTrans(0, 3); // R
      retireLabel.appendChild(retireSpan);

      const retireSelector = document.createElement("select");
      retireSelector.id = "retire";
      retireLabel.appendChild(retireSelector);

      levelSection.appendChild(retireLabel);
    }
    main.appendChild(levelSection);

    const saveSection = document.createElement("div");
    saveSection.classList.add("thing");

    const saveLabel = document.createElement("label");

    const saveSpan = document.createElement("span");
    saveSpan.textContent = this.getTrans(0, 4); // Slot
    saveLabel.appendChild(saveSpan);

    const saveSelector = document.createElement("select");
    saveSelector.id = "save-selector";
    saveLabel.appendChild(saveSelector);

    saveSection.appendChild(saveLabel);

    const thing = [
      ["save-button", 5],
      ["load-button", 6],
      ["text-export", 7],
      ["url-export", 8]
    ];

    for (let [button_id, trans_id] of thing) {
      const button = document.createElement("input");
      button.id = button_id;
      button.type = "button";
      button.value = this.getTrans(0, trans_id);
      saveSection.appendChild(button);
    }

    main.appendChild(saveSection);

    const pointSection = document.createElement("div");
    pointSection.classList.add("thing");

    const pointsSpan = document.createElement("span");
    pointsSpan.textContent = `${this.getTrans(0, 9)}: `;

    const currentSpan = document.createElement("span");
    currentSpan.id = "points-current";
    pointsSpan.appendChild(currentSpan);

    pointsSpan.insertAdjacentText("beforeend", "/");

    const totalSpan = document.createElement("span");
    totalSpan.id = "points-total";
    pointsSpan.appendChild(totalSpan);

    pointSection.appendChild(pointsSpan);

    const resetButton = document.createElement("input");
    resetButton.id = "reset-points";
    resetButton.type = "button";
    resetButton.value = this.getTrans(0, 10);

    pointSection.appendChild(resetButton);

    main.appendChild(pointSection);

    header.appendChild(main);
  }

  setLevelCaps() {
    if (this.levelCaps.length === 1) {
      this._levelCap = 0;
      return
    }

    const levelCapSelect = document.getElementById("level-cap");
    while (levelCapSelect.lastChild) levelCapSelect.removeChild(levelCapSelect.lastChild);

    for (const [id, level] of this.levelCaps) {
      const option = document.createElement("option");
      option.value = id.toString();
      option.textContent = level.toString();
      levelCapSelect.appendChild(option);
    }

    const self = this;
    levelCapSelect.addEventListener("change", function() {
      self.levelCap = this.value;
      self.updateURI();
    });
  }

  setLevels() {
    const levelSelect = document.getElementById("level");
    while (levelSelect.lastChild) levelSelect.removeChild(levelSelect.lastChild);

    for (let i = 1; i <= this.levelCap; i++) {
      const option = document.createElement("option");
      option.value = i.toString();
      option.textContent = i.toString();
      levelSelect.appendChild(option);
    }

    this.currentLevel = this.currentLevel > this.levelCap ? this.levelCap : this.currentLevel;
  }

  setRetireLevels() {
    const levelSelect = document.getElementById("level");
    const self = this;

    levelSelect.addEventListener("change", function() {
      self.currentLevel = this.value;
      self.updateURI();
    });

    if (this.retireBonuses.length === 0) return;

    const retireSelect = document.getElementById("retire");
    while (retireSelect.lastChild) retireSelect.removeChild(retireSelect.lastChild);

    for (const [id, levels,] of this.retireBonuses) {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = levels;
      retireSelect.appendChild(option);
    }

    retireSelect.addEventListener("change", function() {
      self.retireLevel = this.value;
      self.updateURI();
    });
  }

  setClasses(secondary=true) {
    for (const thing of ["primary", "secondary"]) {
      if (!secondary && thing === "secondary") continue;

      const id = `class-selector-${thing}`;

      const classSelect  = document.getElementById(id);
      while (classSelect.lastChild) classSelect.removeChild(classSelect.lastChild);

      if (thing === "secondary") {
        const option = document.createElement("option");
        option.value = "None";
        option.textContent = "None";
        classSelect.appendChild(option);
      }

      for (const cls of this.classes) {
        const option = document.createElement("option");
        option.value = cls.id;
        option.textContent = cls.name;
        classSelect.appendChild(option);
      }

      const self = this;
      document.getElementById(id).addEventListener("change", function() {
        const value = this.value !== "None" ? parseInt(this.value) : null;
        if (thing === "primary") { self.class = value; }
        else { self.subClass = value; }

        self.updateURI();
      });
    }
  }

  disableClasses(primary=true) {
    const id = `#class-selector-${primary ? "secondary" : "primary"}`;

    const options = document.querySelectorAll(`${id} option[disabled]`);
    for (const option of options) option.disabled = false;

    const cls = primary ? this.class : this.subClass;
    if (!cls) return;

    document.querySelector(`${id} option[value="${cls.id}"]`).disabled = true;
  }

  createSkillNodes(primary=true) {
    const section = primary ? "primary" : "secondary";

    const sectionLayer = document.getElementById(`tree-${section}`);
    while (sectionLayer.lastChild) sectionLayer.removeChild(sectionLayer.lastChild);

    const cls = primary ? this.class : this.subClass;
    if (!cls) return;

    for (const skill of cls.skills) {
      if (skill.unique && section === "secondary") continue;

      const x = skill.coords.x * horizontalBuffer;
      const y = skill.coords.y * verticalBuffer;

      const node = document.createElement("div");
      node.classList.add("skill");
      node.classList.add(`skill-${section}`);
      node.id = `skill-${skill.id}`;

      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      const nameDiv = document.createElement("div");
      nameDiv.classList.add("skill-name");
      nameDiv.textContent = skill.name;
      node.appendChild(nameDiv);

      const levelNode = document.createElement("div");

      levelNode.classList.add("skill-type");

      if (skill.maxLevel === 0) {
        node.classList.add("skill-available");
        levelNode.classList.add("skill-type-special");
        levelNode.textContent = skill.prereqs.length === 0 ? "BOOST" : "BREAK";
      } else {
        levelNode.classList.add("skill-type-normal");

        const currentLevel = document.createElement("span");
        currentLevel.classList.add("skill-current-level");
        levelNode.appendChild(currentLevel);

        const maxLevel = document.createElement("span");
        maxLevel.classList.add("skill-max-level");
        maxLevel.textContent = skill.maxLevel;
        levelNode.appendChild(maxLevel);
      }

      node.appendChild(levelNode);
      sectionLayer.appendChild(node);

      Simulator.drawLines(sectionLayer, skill);
    }

    for (const skill of cls.skills) Simulator.drawLevels(sectionLayer, skill);

    this.updateNodes();

    const self = this;
    const nodes = document.querySelectorAll(`.skill-${section}.skill`);

    for (const node of nodes) {
      node.addEventListener("click", function() {
        const [, skillID] = node.id.split("-");
        self.skills[skillID].level += 1;
        self.updateURI();
      });

      node.addEventListener("contextmenu", function(e) {
        e.preventDefault();
        const [, skillID] = node.id.split("-");
        self.skills[skillID].level -= 1;
        self.updateURI();
      });

      node.addEventListener("mouseenter", function() {
        const [, skillID] = node.id.split("-");
        self.createInfoNode(self.skills[skillID]);
      });

      node.addEventListener("mouseleave", function() {
        self.removeInfoNode();
      });
    }
  }

  createInfoNode(skill) {
    const maxLevel = this.levelData && this.levelData.length > 0 ? this.levelData[0].levels.length : 1;

    const tableLength = 1 + maxLevel;

    const skillInfo = document.createElement("div");
    skillInfo.classList.add("skill-info");
    skillInfo.style.display = "none";
    skillInfo.id = `skill-info-${this.id}`;

    const infoTable = document.createElement("table");

    const nameTitleRow = document.createElement("tr");

    const nameTitle = document.createElement("th");
    nameTitle.textContent = "Name";
    nameTitleRow.appendChild(nameTitle);

    const usesTitle = document.createElement("th");
    usesTitle.textContent = "Uses";
    usesTitle.colSpan = maxLevel;
    nameTitleRow.appendChild(usesTitle);

    infoTable.appendChild(nameTitleRow);

    const nameRow = document.createElement("tr");

    const name = document.createElement("td");
    name.textContent = this.name;
    nameRow.appendChild(name);

    const usesText = "N/A";

    const uses = document.createElement("td");
    uses.textContent = usesText;
    uses.colSpan = maxLevel;
    nameRow.appendChild(uses);

    infoTable.appendChild(nameRow);

    const descriptionRow = document.createElement("tr");

    const description = document.createElement("td");
    description.textContent = this.description;
    description.classList.add("skill-description");
    description.colSpan = tableLength;
    descriptionRow.appendChild(description);

    infoTable.appendChild(descriptionRow);

    if (this.levelData) {
      let levelHeader = document.createElement("tr");

      let levelType = document.createElement("th");
      levelType.textContent = this.maxLevel === 0 ? "Stage" : "Level";
      levelHeader.appendChild(levelType);

      for (let i of [...Array(maxLevel).keys()].map(i => ++i)) {
        let level = document.createElement("th");
        level.textContent = i.toString();
        if (i === this.level) level.classList.add("info-current-level");
        levelHeader.appendChild(level);
      }
      infoTable.appendChild(levelHeader);

      for (const info of this.levelData) {
        let attributeRow = document.createElement("tr");

        let attributeName = document.createElement("th");
        attributeName.textContent = info.name;
        attributeRow.appendChild(attributeName);

        let currentLevel = 0;
        while (currentLevel + 1 <= info.levels.length) {
          let attributeCell = document.createElement("td");
          let attributeValue = info.levels[currentLevel];
          let colspan = 1;

          while (info.levels[++currentLevel] === attributeValue) ++colspan;

          if (this.level >= currentLevel + 1 - colspan && currentLevel + 1 > this.level)
            attributeCell.classList.add("info-current-level");

          attributeCell.colSpan = colspan;
          attributeCell.textContent = attributeValue;
          attributeRow.appendChild(attributeCell);
        }
        infoTable.appendChild(attributeRow);
      }
    }
    skillInfo.appendChild(infoTable);
    document.body.appendChild(skillInfo);
    this.setDimensions();
  }

  showInfoNode() {
    document.getElementById(`skill-info-${this.id}`).style.display = "initial";
    this.setPosition();
  }

  hideInfoNode() {
    document.getElementById(`skill-info-${this.id}`).style.display = "none";
  }

  setDimensions() {
    const infoNode = document.getElementById(`skill-info-${this.id}`);
    infoNode.style.display = "initial";
    infoNode.style.width = "";

    const desc = infoNode.getElementsByClassName("skill-description")[0];

    desc.style.display = "none";

    let infoRect = infoNode.getBoundingClientRect();

    const width = infoRect.width;

    infoNode.style.width = `${width}px`;

    desc.style.display = "";
    infoNode.style.display = "none";
  }

  removeInfoNode() {
    let info = document.querySelector(".skill-info");

    if (info) document.body.removeChild(info);
  }

  setPosition() {
    const infoNode = document.getElementById(`skill-info-${this.id}`);
    const skillNode = document.getElementById(`skill-${this.id}`);

    const infoRect = infoNode.getBoundingClientRect();
    const skillRect = skillNode.getBoundingClientRect();

    const width = infoRect.width;
    const height = infoRect.height;

    let posX = skillRect.left + 7 + window.scrollX;
    let posY = skillRect.top + nodeHeight + verticalPadding + window.scrollY;

    if (window.innerWidth < posX + width) posX = window.innerWidth + window.scrollX - width - 17;
    if (window.innerHeight < posY + height) posY = skillRect.top + window.scrollY - height - verticalPadding + 5;

    infoNode.style.left = `${posX}px`;
    infoNode.style.top = `${posY}px`;
  }

  static drawLines(tree, skill) {
    if (skill.forwards.length > 0) {
      const startX = skill.coords.x * horizontalBuffer + nodeWidth + nodeBorder * 2;
      const startY = skill.coords.y * verticalBuffer + nodeHeight / 2;

      const forwardX = skill.forwards[0][0].coords.x;
      const xDiff = forwardX - skill.coords.x - 1;

      const length = horizontalPadding / 2 + xDiff * horizontalBuffer;

      Simulator.drawHorizontalLine(tree, startX, startY, length);

      if (skill.forwards.length > 1) {
        const forwardYs = skill.forwards.map(([forward,]) => forward.coords.y);
        const minY = Math.min(...forwardYs);
        const maxY = Math.max(...forwardYs);

        const x = forwardX * horizontalBuffer - horizontalPadding / 2;
        const y = minY * verticalBuffer + nodeHeight / 2;
        Simulator.drawVerticalLine(tree, x, y, verticalBuffer * (maxY - minY) + 4);
      }
    }

    if (skill.prereqs.length > 0) {
      const startX = skill.coords.x * horizontalBuffer - horizontalPadding / 2;
      const startY = skill.coords.y * verticalBuffer + nodeHeight / 2;

      Simulator.drawHorizontalLine(tree, startX, startY, horizontalPadding / 2);

      if (skill.prereqs.length > 1) {
        const depYs = skill.prereqs.map(([dep,]) => dep.coords.y);
        const minY = Math.min(...depYs);
        const maxY = Math.max(...depYs);

        const x = skill.coords.x * horizontalBuffer - horizontalPadding / 2;
        const y = minY * verticalBuffer + nodeHeight / 2;
        Simulator.drawVerticalLine(tree, x, y, verticalBuffer * (maxY - minY) + 4);
      }
    }
  }

  static drawLevels(tree, skill) {
    if (skill.forwards.length === 0) return;

    const startX = skill.coords.x * horizontalBuffer + nodeWidth + nodeBorder * 2;
    const startY = skill.coords.y * verticalBuffer + nodeHeight / 2;

    const levels = [...new Set(skill.forwards.map(([,level]) => level))];
    const multi = levels.length > 1;

    for (const [forward, level] of skill.forwards) {
      if (level === 0) continue;

      const levelReq = document.createElement("div");
      levelReq.classList.add("level-req");
      levelReq.textContent = `Lv${level}`;
      levelReq.style.left = `${startX + 8}px`;
      levelReq.style.top = `${multi ? forward.coords.y * verticalBuffer + nodeHeight / 2 - 10 : startY - 10}px`;
      tree.appendChild(levelReq);

      if (!multi) break;
    }
  }

  static drawVerticalLine(tree, x, y, length) {
    const line = document.createElement("div");
    line.classList.add("line");
    line.style.width = "4px";
    line.style.height = `${length}px`;
    line.style.left = `${x}px`;
    line.style.top = `${y}px`;
    tree.appendChild(line);
  }

  static drawHorizontalLine(tree, x, y, length) {
    const line = document.createElement("div");
    line.classList.add("line");
    line.style.width = `${length}px`;
    line.style.height = "4px";
    line.style.left = `${x}px`;
    line.style.top = `${y}px`;
    tree.appendChild(line);
  }

  updateNodes() {
    for (const skill of this.skills) {
      const skillNode = document.getElementById(`skill-${skill.id}`);

      if (skillNode === null) continue;
      if (skill.maxLevel === 0) continue;

      const available = skill.prereqs.filter(([skill, reqLevel]) => reqLevel > skill.level).length === 0;

      skillNode.getElementsByClassName("skill-current-level")[0].textContent = skill.level;
      skillNode.classList.remove(`skill-${(available ? "un" : "") + "available"}`);
      skillNode.classList.add(`skill-${(available ? "" : "un") + "available"}`);
    }

    this.updateSkillPoints();
  }

  updateSkillPoints() {
    document.getElementById("points-total").textContent = this.pointsTotal;
    document.getElementById("points-current").textContent = this.pointsCurrent;
  }

  updateURI() {
    const saveData = this.generateSaveData();
    if (saveData !== history.state) history.pushState(saveData, "", `?${saveData}`);
  }

  get additionalSaveLength() {
    return 0;
  }

  generateSaveData() {
    const canSub = this.subClassPenalty !== null;
    const canUnlockCap = this.levelCaps.length !== 1;
    const canRetire = this.retireBonuses.length !== 0;

    const hasSub = !!this.subClass;

    const length = 2 + (canSub ? 1 : 0) + (canUnlockCap ? 1 : 0) + (canRetire ? 1 : 0) +
      this.class.skills.length + (hasSub ? this.subClass.skills.length : 0) + this.additionalSaveLength;
    let view = new Uint8Array(length);

    let currentPos = 0;

    view[currentPos++] = this._class + 1;
    if (canSub) view[currentPos++] = hasSub ? this._subClass + 1 : 0;
    view[currentPos++] = this._currentLevel;
    if (canUnlockCap) view[currentPos++] = this._levelCap;
    if (canRetire) view[currentPos++] = this._retireLevel;

    [view, currentPos] = this.generateAdditionalSaveData(view, currentPos);

    for (const cls of [this.class, this.subClass]) {
      if (!cls) continue;
      for (const skill of cls.skills) view[currentPos++] = skill.level;
    }

    const saveData = btoa(String.fromCharCode(...view));

    return LZString.compressToEncodedURIComponent(saveData);
  }

  generateAdditionalSaveData(view, currentPos) {
    return [view, currentPos];
  }

  loadSaveData(queryString) {
    const canSub = this.subClassPenalty !== null;
    const canUnlockCap = this.levelCaps.length !== 1;
    const canRetire = this.retireBonuses.length !== 0;

    const saveData = LZString.decompressFromEncodedURIComponent(queryString);
    let view = Uint8Array.from(atob(saveData), c => c.charCodeAt(0));

    let currentPos = 0;

    this.class = view[currentPos++] - 1;
    if (canSub) {
      const sub = view[currentPos++];
      this.subClass = sub === 0 ? null : sub - 1;
    }
    this.currentLevel = view[currentPos++];
    this.levelCap = canUnlockCap ? view[currentPos++] : 0;
    this.retireLevel = canRetire ? view[currentPos++] : 0;

    [view, currentPos] = this.loadAdditionalSaveData(view, currentPos);

    for (const cls of [this.class, this.subClass]) {
      if (!cls) continue;
      for (const skill of cls.skills) skill.level = view[currentPos++];
    }
  }

  loadAdditionalSaveData(view, currentPos) {
    return [view, currentPos];
  }

  saveSave() {
    const slot = document.getElementById("save-selector").value;
    const saveData = this.generateSaveData();

    Simulator.setCookie(`save-${slot}`, saveData);
    Simulator.loadSaveSlots();
    document.getElementById("save-selector").value = slot;

    alert(`Build successfully saved to slot ${slot}.`);
  }

  loadSave() {
    const slot = document.getElementById("save-selector").value;
    const cookie = Simulator.getCookie(`save-${slot}`);

    if (!cookie) return;

    this.loadSaveData(cookie);
    this.updateURI();

    alert(`Build successfully loaded from slot ${slot}.`);
  }

  static loadSaveSlots() {
    const saveSelect = document.getElementById("save-selector");
    while (saveSelect.lastChild) saveSelect.removeChild(saveSelect.lastChild);

    for (const i of [...Array(30).keys()].map(i => i + 1)) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Save ${i}`;
      saveSelect.appendChild(option);
    }
  }

  static setCookie(name, value, days=365, path=window.location.pathname) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=${path}`;
  }

  static getCookie(name) {
    const cookie = decodeURIComponent(document.cookie).match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return cookie ? cookie.pop() : "";
  }

  exportText() {

  }

  generateText(omitSkills=false) {
    const canSub = this.subClassPenalty !== null;
    const canUnlockCap = this.levelCaps.length !== 1;
    const canRetire = this.retireBonuses.length !== 0;

    const hasSub = !!this.subClass;

    let text = `Class: ${this.class.name}`;
    if (canSub) text += `\nSubclass: ${hasSub ? this.subClass.name : "None"}`;
    text += `\nLevel: ${this.currentLevel}`;
    if (canUnlockCap) text += `\nLevel Cap: ${this.levelCap}`;
    if (canRetire) text += `\nRetired At: ${this.retireLevel}`;
    text += `\nSkill Points: ${this.pointsCurrent}/${this.pointsTotal}`;

    text += this.additionalSaveText();

    text += `\n\nClass:`;

    for (let skill of this.class.skills) {
      if (skill.maxLevel === 0) continue;
      if (omitSkills && skill.level === 0) continue;

      text += `\n  ${skill.name}: ${skill.level}/${skill.maxLevel}`;
    }

    if (hasSub) {
      text += `\n\nSubclass:`;
      for (let skill of this.subClass.skills) {
        if (skill.unique) continue;
        if (omitSkills && skill.level === 0) continue;

        text += `\n  ${skill.name}: ${skill.level}/${skill.maxLevel}`;
      }
    }

    text += `\n\nCode: ${this.generateSaveData()}\nGenerated At ${location.pathname}`;

    return text;
  }

  additionalSaveText() {
    return "";
  }
}
