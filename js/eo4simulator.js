document.addEventListener("DOMContentLoaded", () => {
  simulator = new EO4Simulator({});
});


class EO4Simulator extends Simulator {
  get subClassPenalty() {
    return 2;
  }
}
