const html = `$("#universe").line(universe.left + -123, 1120 - 456, universe.left + 789, 1120 - -12, {color: "#2660A2",style: "dashed",stroke: "1",zindex: 1});`;
const lineRegex = /\$\("#universe"\)\.line\(universe\.left \+ ([-\d.]+),\s*1120 - ([-\d.]+),\s*universe\.left \+ ([-\d.]+),\s*1120 - ([-\d.]+)/;

const lineMatch = html.match(lineRegex);
if (lineMatch) {
    console.log("MATCH:");
    console.log("x1:", lineMatch[1]);
    console.log("y1:", lineMatch[2]);
    console.log("x2:", lineMatch[3]);
    console.log("y2:", lineMatch[4]);
} else {
    console.log("NO MATCH");
}
