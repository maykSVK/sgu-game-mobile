const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/frontend/src/views/UniverseView.vue";
let content = fs.readFileSync(path, "utf8");

const targetLineSvg = `
          <!-- ACTIVE FLIGHT LINE -->
          <g v-if="universeData.destiny.target">
            <line 
              :x1="universeData.destiny.x + 8" 
              :y1="(1000 - universeData.destiny.y) + 3" 
              :x2="universeData.destiny.target.x" 
              :y2="(1000 - universeData.destiny.target.y)" 
              stroke="#00c3ff" 
              stroke-width="1.5" 
              stroke-dasharray="4,4" 
            />
          </g>
`;

content = content.replace("</svg>", targetLineSvg + "\n          </svg>");

const targetPointHtml = `
          <!-- ACTIVE FLIGHT TARGET POINT -->
          <div v-if="universeData.destiny.target"
            class="target-point space-object"
            style="transform: translate(-12px, -24px); z-index: 10;"
            :style="{ left: universeData.destiny.target.x + 'px', top: (1000 - universeData.destiny.target.y) + 'px' }"
          ></div>
`;

content = content.replace("<!-- SVG Linia drahy a Radiusy -->", targetPointHtml + "\n          <!-- SVG Linia drahy a Radiusy -->");
content = content.replace("background: radial-gradient(circle, rgba(11, 19, 25, 0.95) 0%, rgba(11, 19, 25, 0.6) 60%, rgba(11, 19, 25, 0) 100%);", "/* Removed radial background */");

fs.writeFileSync(path, content);
