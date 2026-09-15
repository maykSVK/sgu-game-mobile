const str = "$('.target-point').offset({left: universe.left + (-12),top: universe.top + 1000 - (124)});";
const regex = /\$\('\.target-point'\)\.offset\(\{left: universe\.left \+ \(([^)]+)\),top: universe\.top \+ 1000 - \(([^)]+)\)\}/;
const match = str.match(regex);
console.log(match ? match[1] + " and " + match[2] : "NO MATCH");
