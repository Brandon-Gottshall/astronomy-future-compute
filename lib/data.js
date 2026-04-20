// Single source of truth for content. Edit text/numbers here.
// Shape mirrors the original ASTRO Presentation Site.html (DATA + COPY).

export const DATA = {
meta:{title:"Astronomy’s Future Compute",subtitle:"Comparing land-based, underwater, and orbital data-center paths for modern astronomy",course:"ASTR 1020K \u2014 Stars & Galaxies",authors:["Brandon Gottshall","Tre Madison"],date:"Spring 2026"},
sections:[
{id:"hero",title:"Astronomy’s Future Compute",nav:"Home"},
{id:"problem",title:"Baseline constraints",nav:"Baseline constraints"},
{id:"pathways",title:"Three Pathways",nav:"Pathways"},
{id:"astronomy",title:"Astronomy Impact",nav:"Astronomy"},
{id:"objections",title:"Questions and objections",nav:"Objections"},
{id:"recommendations",title:"Recommendations",nav:"Takeaways"},
{id:"references",title:"References",nav:"Sources"}],
sources:[
{id:"course-rubric",label:"ASTR 1020 rubric (uploaded assignment instructions)",url:"",type:"rubric",year:"2026"},
{id:"packet-framing",label:"Deep Research 1 \u2014 Framing audit and astronomy hinge",url:"",type:"uploaded",year:"2026"},
{id:"packet-baseline",label:"Deep Research 2 \u2014 Baseline ecological impacts",url:"",type:"uploaded",year:"2026"},
{id:"packet-underwater-advantages",label:"Deep Research 3 \u2014 Underwater advantages",url:"",type:"uploaded",year:"2026"},
{id:"packet-underwater-critiques",label:"Deep Research 4 \u2014 Underwater critiques",url:"",type:"uploaded",year:"2026"},
{id:"packet-orbital",label:"Deep Research 5 \u2014 Orbital feasibility",url:"",type:"uploaded",year:"2026"},
{id:"packet-orbital-dup",label:"Deep Research 6 \u2014 duplicate orbital feasibility brief",url:"",type:"uploaded",year:"2026"},
{id:"iea-energy-ai",label:"IEA \u2014 Energy and AI",url:"https://www.iea.org/reports/energy-and-ai/executive-summary",type:"official",year:"2026"},
{id:"lbnl-report",label:"LBNL \u2014 2024 U.S. Data Center Energy Usage Report",url:"https://eta-publications.lbl.gov/sites/default/files/2024-12/lbnl-2024-united-states-data-center-energy-usage-report_1.pdf",type:"official",year:"2024"},
{id:"doe-release",label:"DOE release summarizing the Berkeley Lab report",url:"https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers",type:"official",year:"2024"},
{id:"rubin-data",label:"Rubin Observatory \u2014 data systems and volumes",url:"https://rubinobservatory.org/explore/how-rubin-works/technology/data",type:"official",year:"2026"},
{id:"skao-big-data",label:"SKAO \u2014 big data overview",url:"https://www.skao.int/en/explore/big-data",type:"official",year:"2026"},
{id:"natick-site",label:"Microsoft Project Natick",url:"https://natick.research.microsoft.com/",type:"official",year:"2020"},
{id:"microsoft-2018",label:"Microsoft \u2014 2018 Natick deployment story",url:"https://news.microsoft.com/features/under-the-sea-microsoft-tests-a-datacenter-thats-quick-to-deploy-could-provide-internet-connectivity-for-years/",type:"official",year:"2018"},
{id:"microsoft-2020",label:"Microsoft \u2014 Natick retrieval feature",url:"https://news.microsoft.com/source/features/sustainability/project-natick-underwater-datacenter/",type:"official",year:"2020"},
{id:"dcd-natick-ended",label:"DatacenterDynamics \u2014 Microsoft confirms Natick is no more",url:"https://www.datacenterdynamics.com/en/news/microsoft-confirms-project-natick-underwater-data-center-is-no-more/",type:"journalism",year:"2024"},
{id:"ieee-spectrum-natick",label:"IEEE Spectrum \u2014 Build it underwater",url:"https://spectrum.ieee.org/computing/hardware/want-an-energyefficient-data-center-build-it-underwater",type:"journalism",year:"2017"},
{id:"peoples-daily-hainan-2024",label:"People\u2019s Daily \u2014 Hainan first-phase and savings claims",url:"https://www.news.cn/tech/20240116/87efda594f74482bac284b1c04d5b403/c.html",type:"official",year:"2024"},
{id:"peoples-daily-hainan-2026",label:"People\u2019s Daily \u2014 Hainan cluster context and 2026 claims",url:"https://en.people.cn/n3/2026/0331/c98649-20441982.html",type:"official",year:"2026"},
{id:"shanghai-official-2025",label:"Shanghai official portal \u2014 project launch",url:"https://english.shanghai.gov.cn/en-Strength-Scitechcenter/20250611/c60460fe62e440d08b62be991cade0c9.html",type:"official",year:"2025"},
{id:"mot-2026",label:"Ministry of Transport of China \u2014 Lingang undersea DC put into use",url:"https://www.mot.gov.cn/xinwen/jiaotongyaowen/202602/t20260214_4200349.html",type:"official",year:"2026"},
{id:"cctv-2026",label:"CCTV Energy \u2014 Lingang savings claims",url:"https://energy.cctv.com/2026/02/10/ARTIx8azLjXTYlkH29FIAqVm260210.shtml",type:"official",year:"2026"},
{id:"scientific-american-udc",label:"Scientific American \u2014 China powers AI boom with undersea data centers",url:"https://www.scientificamerican.com/article/china-powers-ai-boom-with-undersea-data-centers/",type:"journalism",year:"2025"},
{id:"noaa-reef-2012",label:"NOAA \u2014 artificial reef science review",url:"https://nmssanctuaries.blob.core.windows.net/sanctuaries-prod/media/archive/science/conservation/pdfs/artificial_reef.pdf",type:"official",year:"2012"},
{id:"noaa-reef-2024",label:"NOAA-hosted 2024 artificial reef risk synthesis",url:"https://repository.library.noaa.gov/view/noaa/56899/noaa_56899_DS1.pdf",type:"official",year:"2024"},
{id:"nature-cable",label:"Nature Communications \u2014 cable burial carbon disturbance",url:"https://www.nature.com/articles/s41467-023-37854-6",type:"academic",year:"2023"},
{id:"frontiers-thermal",label:"Frontiers in Marine Science \u2014 thermal discharge review",url:"https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2024.1465289/full",type:"academic",year:"2024"},
{id:"scientific-reports-heatwaves",label:"Scientific Reports \u2014 marine heatwaves and underwater cooling",url:"https://www.nature.com/articles/s41598-022-21293-2",type:"academic",year:"2022"},
{id:"marad-biofouling",label:"MARAD \u2014 biofouling and seawater heat exchangers",url:"https://www.maritime.dot.gov/sites/marad.dot.gov/files/2022-09/Interphase%20Materials%20MMA%20Final%20Report.pdf",type:"official",year:"2022"},
{id:"dnv-corrosion",label:"DNV recommended practice \u2014 cathodic protection limits",url:"https://bornagodaz.com/wp-content/uploads/2025/11/DNV-RP-B401-2021.pdf",type:"industry",year:"2021"},
{id:"usace-section10",label:"USACE \u2014 Section 10 structures in navigable waters",url:"https://www.spl.usace.army.mil/Missions/Regulatory/Jurisdictional-Determination/Section-10-of-the-Rivers-Harbors-Act/",type:"official",year:"2026"},
{id:"epa-404",label:"EPA \u2014 Clean Water Act Section 404",url:"https://www.epa.gov/cwa-404",type:"official",year:"2026"},
{id:"wired-networkocean",label:"Wired \u2014 NetworkOcean permitting scrutiny",url:"https://www.wired.com/story/networkocean-datacenter-san-francisco-bay-environment",type:"journalism",year:"2024"},
{id:"fcc-public-notice",label:"FCC Public Notice DA 26-113",url:"https://docs.fcc.gov/public/attachments/DA-26-113A1.pdf",type:"official",year:"2026"},
{id:"spacex-application",label:"GeekWire-hosted copy of SpaceX orbital-compute filing narrative",url:"https://cdn.geekwire.com/wp-content/uploads/2026/01/SpaceX-Center.pdf",type:"journalism",year:"2026"},
{id:"xinhua-three-body",label:"Xinhua \u2014 Three-Body Computing Constellation launch",url:"https://www.news.cn/politics/20250514/3123b1e2612147a4877c0e4d21662691/c.html",type:"official",year:"2025"},
{id:"xinhua-feasibility",label:"Xinhua \u2014 space-based intelligent computing constellation feasibility study",url:"https://english.news.cn/20260405/849c211dea3a43bcacb61bcacd296f8f/c.html",type:"official",year:"2026"},
{id:"zhejiang-lab",label:"Zhejiang Lab \u2014 onboard intelligent computer and concept notes",url:"https://en.zhejianglab.com/news/202410/t20241008_4049.shtml",type:"official",year:"2024"},
{id:"eprs-space",label:"European Parliament \u2014 What if AI data centres were put in space?",url:"https://www.europarl.europa.eu/RegData/etudes/ATAG/2026/774746/EPRS_ATA%282026%29774746_EN.pdf",type:"official",year:"2026"},
{id:"cordis-ascend",label:"CORDIS \u2014 ASCEND project reporting",url:"https://cordis.europa.eu/project/id/101082517/reporting",type:"official",year:"2026"},
{id:"thales-ascend",label:"Thales Alenia Space \u2014 ASCEND feasibility press release",url:"https://www.thalesaleniaspace.com/en/press-releases/thales-alenia-space-reveals-results-ascend-feasibility-study-space-data-centers-0",type:"official",year:"2024"},
{id:"nasa-solar",label:"NASA \u2014 solar irradiance reference",url:"https://earth.gsfc.nasa.gov/climate/projects/solar-irradiance/science",type:"official",year:"2019"},
{id:"nasa-thermal",label:"NASA Smallsat thermal control overview",url:"https://www.nasa.gov/smallsat-institute/sst-soa/thermal-control/",type:"official",year:"2025"},
{id:"nasa-iss-atcs",label:"NASA \u2014 ISS ATCS overview",url:"https://www.nasa.gov/wp-content/uploads/2021/02/473486main_iss_atcs_overview.pdf",type:"official",year:"2021"},
{id:"nasa-rad-effects",label:"NASA NEPP \u2014 Radiation Effects 101",url:"https://nepp.nasa.gov/docuploads/392333B0-7A48-4A04-A3A72B0B1DD73343/Rad_Effects_101_WebEx.pdf",type:"official",year:"2004"},
{id:"itu-space",label:"ITU \u2014 space regulatory framework summary",url:"https://www.itu.int/en/ITU-R/space/snl/Documents/ITU-Space_reg.pdf",type:"official",year:"2015"},
{id:"faa-ost",label:"FAA \u2014 Outer Space Treaty text excerpt",url:"https://www.faa.gov/about/office_org/headquarters_offices/ast/media/treaty_Princi_Gov_Acti_States_OST.pdf",type:"official",year:"1967"},
{id:"satcon1-baas",label:"SATCON1 executive summary (BAAS)",url:"https://baas.aas.org/pub/2020i0206",type:"academic",year:"2020"},
{id:"lsst-impact",label:"Wide-field survey exposure impact preprint",url:"https://arxiv.org/abs/2003.01992",type:"academic",year:"2020"},
{id:"aanda-radio",label:"A&A \u2014 unintended emissions relevant to radio astronomy",url:"https://www.aanda.org/articles/aa/full_html/2023/08/aa46374-23/aa46374-23.html",type:"academic",year:"2023"},
{id:"esa-debris",label:"ESA Space Environment Report 2025",url:"https://www.esa.int/Space_Safety/Space_Debris/ESA_Space_Environment_Report_2025",type:"official",year:"2025"},
{id:"iau-cps",label:"IAU Centre for the Protection of the Dark and Quiet Sky from Satellite Constellation Interference",url:"https://cps.iau.org/",type:"official",year:"2022"},
{id:"borlaff-nature-2025",label:"Borlaff, Marcum, Howell \u2014 Nature (December 2025): projected satellite-trail contamination of upcoming wide-field LEO surveys",url:"",type:"academic",year:"2025"}],
metrics:[
{id:"global-electricity-2024",label:"Global data-center electricity",value:"~415 TWh",sub:"2024 estimate",detail:"about 1.5% of global electricity; IEA says strong AI-driven growth is likely",pathways:["land"]},
{id:"global-electricity-2030",label:"Global 2030 base case",value:"~945 TWh",sub:"IEA base case",detail:"roughly double 2024 in the base case, with scenario uncertainty",pathways:["land"]},
{id:"us-electricity-2023",label:"U.S. data-center share",value:"~4.4%",sub:"2023 electricity",detail:"DOE / Berkeley Lab summary for 2023, with much higher 2028 scenarios",pathways:["land"]},
{id:"us-electricity-2028",label:"U.S. 2028 range",value:"~6.7\u201312%",sub:"scenario range",detail:"shows why grid and siting debates have intensified",pathways:["land"]},
{id:"cooling-share",label:"Cooling overhead",value:"~7% to >30%",sub:"by facility quality",detail:"efficient hyperscale can be low, weaker enterprise environments can be much higher",pathways:["land","underwater","orbital"]},
{id:"site-wue",label:"Average U.S. site WUE",value:"~0.36 L/kWh",sub:"through 2023",detail:"projected to rise under some AI-liquid-cooling assumptions",pathways:["land"]},
{id:"indirect-water",label:"Indirect water footprint",value:"~800B liters",sub:"U.S. 2023 estimate",detail:"shows why source water matters, not just site water",pathways:["land"]},
{id:"natick-phase1",label:"Natick Phase 1 PUE/WUE",value:"1.07 / 0",sub:"claimed",detail:"strong prototype signal, but still first-party reporting",pathways:["underwater"]},
{id:"natick-phase2-reliability",label:"Natick reliability",value:"1/8 failure rate",sub:"vs land control",detail:"summary-level public claim after retrieval",pathways:["underwater"]},
{id:"hainan-pue",label:"Hainan claimed PUE",value:"~1.1",sub:"repeated claim",detail:"credible repetition, but underlying report access is weak",pathways:["underwater"]},
{id:"lingang-pue",label:"Lingang design PUE",value:"\u2264 1.15",sub:"design target",detail:"official design target, not yet a deep public measured time series",pathways:["underwater"]},
{id:"starcloud-scale",label:"Starcloud filing scale",value:"Up to 88,000 sats",sub:"accepted for filing",detail:"acceptance for filing is not approval",pathways:["orbital"]},
{id:"orbit-altitude",label:"Proposed orbital shell",value:"500\u20132,000 km",sub:"LEO / SSO mix",detail:"includes sun-synchronous and 30\u00b0 inclinations",pathways:["orbital"]},
{id:"three-body",label:"Three-Body launch",value:"12 satellites",sub:"2025 launch",detail:"reported 5 POPS and 30 TB total storage in first batch",pathways:["orbital"]},
{id:"ascend-launcher",label:"ASCEND launcher condition",value:"10\u00d7 less emissive",sub:"Thales summary",detail:"space climate case depends on radically cleaner launch assumptions",pathways:["orbital"]},
{id:"rubin-volume",label:"Rubin data volume",value:"~20 TB/night",sub:"observatory scale",detail:"astronomy itself is deeply entangled with data-center-scale compute",pathways:["astronomy","land"]},
{id:"skao-volume",label:"SKAO archive scale",value:">700 PB/year",sub:"observatory scale",detail:"shows why scientific computing belongs in this conversation",pathways:["astronomy","land"]}],
timeline:[
{year:2015,label:"Natick Phase 1 prototype test",pathway:"underwater",note:"105-day underwater prototype off California."},
{year:2017,label:"IEEE Spectrum explains underwater rationale",pathway:"underwater",note:"Cooling and lights-out framing become public."},
{year:2018,label:"Natick Phase 2 deployed near Orkney",pathway:"underwater",note:"Full-scale pod lowered to seabed and cabled up."},
{year:2020,label:"Natick retrieved",pathway:"underwater",note:"Microsoft later reports 1/8 failure rate versus land control."},
{year:2020,label:"SATCON1 warning published",pathway:"astronomy",note:"Astronomy community warns mitigation will not fully solve very large constellations."},
{year:2022,label:"First Hainan underwater cabins deployed",pathway:"underwater",note:"Commercial-style underwater cluster begins to take shape."},
{year:2023,label:"Hainan phase-one milestone reported",pathway:"underwater",note:"Official sources say first business powered and debugged by end of year."},
{year:2023,label:"Cable burial carbon-disturbance paper",pathway:"underwater",note:"Subsea cable burial gets quantified as a sediment-carbon issue."},
{year:2024,label:"DOE / Berkeley Lab release U.S. demand modeling",pathway:"land",note:"Data centers framed as a rising U.S. electricity-share issue."},
{year:2024,label:"Microsoft confirms Natick is no longer active",pathway:"underwater",note:"Technical success does not become active deployment."},
{year:2024,label:"Zhejiang Lab publicizes onboard space-compute concept",pathway:"orbital",note:"China\u2019s space-compute work is not only conceptual."},
{year:2024,label:"ASCEND public feasibility work surfaces",pathway:"orbital",note:"Europe treats space data centers as an industrial-policy feasibility question."},
{year:2024,label:"NetworkOcean permitting scrutiny hits pilot",pathway:"underwater",note:"Permitting becomes a visible commercialization barrier."},
{year:2025,label:"IEA projects strong 2030 demand growth",pathway:"land",note:"Baseline ecological pressure remains the driver behind alternatives."},
{year:2025,label:"Three-Body Computing Constellation launches",pathway:"orbital",note:"China launches first 12-satellite on-orbit compute batch."},
{year:2025,label:"Shanghai Lingang underwater project launches",pathway:"underwater",note:"Offshore-wind-linked commercial underwater case expands."},
{year:2025,label:"Lingang phase-one completion reported",pathway:"underwater",note:"Design PUE target \u22641.15 becomes a public milestone."},
{year:2026,label:"FCC accepts Starcloud orbital-compute filing",pathway:"orbital",note:"Up to 88,000 orbital-compute satellites proposed (File No. SAT-LOA-20260202-00073)."},
{year:2026,label:"China announces new feasibility study",pathway:"orbital",note:"Space-based intelligent computing constellation remains active state interest."},
{year:2026,label:"The paper/presentation must fit ASTR 1020",pathway:"astronomy",note:"Rubric keeps astronomy relevance and your own wording central."}],
pathways:{
land:{label:"Improved land-based",short:"Land",description:"Cleaner land-based data centers remain the most mature near-term path because they attack the existing problem where it already lives.",strongestUpside:"Fastest realistic gains with the strongest evidence base.",strongestDownside:"Still tied to grid congestion, siting conflict, and water-accounting complexity.",evidenceMaturity:"High",astronomyRisk:"Low / indirect"},
underwater:{label:"Underwater",short:"Underwater",description:"Underwater systems have real prototypes and commercial pilots, but they trade land pressure for marine maintenance and permitting problems.",strongestUpside:"Cooling relief, low site-water use, and credible engineering pilots.",strongestDownside:"Maintenance, retrieval, marine ecology, and refresh-cycle mismatch.",evidenceMaturity:"Medium",astronomyRisk:"Low / mostly indirect"},
orbital:{label:"Orbital",short:"Orbital",description:"Orbital data centers are the least mature option and the one with the most direct consequences for astronomy and orbital sustainability.",strongestUpside:"Potential value for space-native compute and on-orbit processing.",strongestDownside:"Heat rejection, radiation, launch cadence, data movement, and direct astronomy risk.",evidenceMaturity:"Low\u2013medium",astronomyRisk:"High / direct"}},
scenarios:[
{id:"shortest-path",label:"Optimize for shortest realistic path",winner:"land",why:"Land-based improvements already have the strongest deployment and evidence maturity."},
{id:"lowest-direct-freshwater",label:"Optimize for lowest direct freshwater use",winner:"underwater",why:"Underwater systems can drive site-water use very low by using seawater cooling."},
{id:"lowest-astronomy-risk",label:"Optimize for lowest astronomy risk",winner:"land",why:"Land and underwater options do not directly crowd the observing environment the way orbital systems do."},
{id:"most-space-native",label:"Optimize for space-native compute ambition",winner:"orbital",why:"Orbital systems make the most sense when the data and compute already live in space."}],
externalities:[
{id:"grid",label:"Grid electricity"},
{id:"site-water",label:"Direct site water"},
{id:"source-water",label:"Indirect/source water"},
{id:"land-footprint",label:"Land footprint"},
{id:"marine-ecology",label:"Marine ecology"},
{id:"seabed",label:"Seabed / cable corridors"},
{id:"sky",label:"Sky brightness / imaging"},
{id:"radio",label:"Radio environment"},
{id:"debris",label:"Orbital traffic / debris"},
{id:"launch",label:"Launch / reentry atmosphere"},
{id:"maintenance",label:"Maintenance / refresh cycle"},
{id:"bandwidth",label:"Data movement bottlenecks"}],
externalityMap:{
land:{grid:{level:"high",note:"The baseline problem already lives here."},"site-water":{level:"medium",note:"Cooling choices can keep this low or push it higher."},"source-water":{level:"high",note:"Electricity generation can dominate total water use."},"land-footprint":{level:"medium",note:"Siting and local opposition stay live issues."},"marine-ecology":{level:"low",note:"Mostly outside the direct footprint."},seabed:{level:"none",note:"No direct subsea corridor burden."},sky:{level:"low",note:"Does not directly change optical observing conditions."},radio:{level:"low",note:"No direct satellite RF issue."},debris:{level:"none",note:"No orbital debris load."},launch:{level:"low",note:"No launch cadence tied to compute placement itself."},maintenance:{level:"medium",note:"Still exposed to rapid hardware refresh cycles."},bandwidth:{level:"medium",note:"Data gravity stays terrestrial but mature."}},
underwater:{grid:{level:"medium",note:"May still rely on terrestrial power unless coupled to offshore wind."},"site-water":{level:"low",note:"Can drive direct freshwater use close to zero on site."},"source-water":{level:"mixed",note:"Indirect water depends on power source and accounting."},"land-footprint":{level:"low",note:"Reduces some land demand but not the shore station."},"marine-ecology":{level:"high",note:"Moves risk into colonization, thermal discharge, and materials questions."},seabed:{level:"high",note:"Cables, anchors, and burial corridors matter."},sky:{level:"none",note:"Does not directly change optical observing conditions."},radio:{level:"low",note:"No direct satellite RF issue."},debris:{level:"none",note:"No orbital debris load."},launch:{level:"low",note:"Ship logistics matter, but not launch/reentry."},maintenance:{level:"high",note:"Lights-out pods clash with fast refresh cycles."},bandwidth:{level:"low",note:"Edge siting near cable landings can help."}},
orbital:{grid:{level:"low",note:"Claims relief through solar input, but total system cost moves elsewhere."},"site-water":{level:"low",note:"No cooling towers in orbit, but this is not the whole water story."},"source-water":{level:"mixed",note:"Launch and manufacturing burdens complicate the clean-water story."},"land-footprint":{level:"low",note:"Ground stations still exist, but compute is displaced upward."},"marine-ecology":{level:"none",note:"Avoids direct marine infrastructure impacts."},seabed:{level:"none",note:"No subsea burial footprint."},sky:{level:"high",note:"Direct optical / NIR observing burden."},radio:{level:"high",note:"Space emitters can interfere beyond intended bands."},debris:{level:"high",note:"Adds to an already crowded orbital environment."},launch:{level:"high",note:"Launch cadence and reentry become part of the ecology."},maintenance:{level:"high",note:"Radiation and replacement cadence make servicing hard."},bandwidth:{level:"high",note:"Space-ground data movement is a core bottleneck."}}},
counterArena:{
land:{objections:["Efficiency gains historically absorbed demand growth, so some argue the crisis is overstated.","Grid, land, and water bottlenecks may outpace efficiency gains in a rapid AI scale-out scenario.","Accounting-based low-carbon procurement complicates carbon-neutrality claims."],survives:["Land-based improvement is still the fastest path with the strongest evidence base.","Efficiency gains are real, but the rate of AI growth now tests their sufficiency.","Grid constraints validate urgency without undermining the value of terrestrial efficiency work."]},
underwater:{objections:["Operator-reported PUE/WUE signals are not independently validated at scale.","Marine ecology, biofouling, and permitting complexity could limit broader commercial scaling.","A sealed pod can succeed technically while failing as a business model."],survives:["The cooling and water-use advantages are physically grounded, not merely promotional claims.","Commercialization risk does not invalidate the engineering feasibility signal.","Niche coastal edge deployments look more defensible than full hyperscale replacement."]},
orbital:{objections:["Abundant solar power and on-orbit processing are genuine advantages for some use cases.","Not all orbital computing means million-satellite constellations.","Some barriers are economic, not physical impossibilities."],survives:["The strongest current case is for niche space-native compute, not mass relief of terrestrial AI demand.","Heat rejection, radiation, and replacement cadence remain unsolved at scale.","Astronomy and debris externalities are direct and largely unmitigated."]}},
chartData:{
energyGrowth:{labels:["2015","2018","2020","2022","2024","2026*","2028*","2030*"],values:[200,260,300,400,415,550,720,945],note:"* = IEA projection"},
astronomyImpact:{categories:["Optical Trail\nContamination","Radio Frequency\nInterference","Debris &\nCollision Risk"],land:[0.5,0.5,0],underwater:[0,0.5,0],orbital:[9,7,8]}},
recommendations:[
{title:"Prioritize terrestrial efficiency first",body:"Land-based improvements are the lowest-risk, highest-evidence path. Grid modernization, better cooling, and smarter siting attack the baseline problem where it already lives.",icon:"\ud83c\udfed"},
{title:"Treat underwater systems as a limited-use option",body:"Real cooling gains and near-zero site water are physically grounded \u2014 but marine ecology, maintenance cycles, and permitting complexity limit scale. Coastal edge deployments look more defensible than hyperscale replacement.",icon:"\ud83c\udf0a"},
{title:"Apply astronomical impact assessments to orbital proposals",body:"Orbital data centers affect sky brightness, radio interference, and orbital congestion. Any large-scale orbital-compute proposal should be evaluated for its effect on the observing environment.",icon:"\ud83d\udd2d"}],
images:{hero:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80",datacenter:"https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",underwater:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",orbital:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",observatory:"https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&q=80"}
};

// COPY is loaded from content/copy.yaml via lib/copy.js (auto-generated).
// To edit copy, edit content/copy.yaml and run: npm run generate-copy
import { COPY } from './copy.js';
export { COPY };
// Merge COPY into DATA exactly like the original post-processing block.
Object.assign(DATA.meta,COPY.meta);
DATA.sections=COPY.atlasSections.map(s=>({...s}));
["land","underwater","orbital"].forEach(key=>{
  Object.assign(DATA.pathways[key],COPY.dataCopy.pathways[key]);
});
DATA.scenarios=COPY.dataCopy.scenarios.map(item=>({...item}));
DATA.externalities=COPY.dataCopy.externalities.map(item=>({...item}));
Object.keys(COPY.dataCopy.counterArena).forEach(key=>{
  DATA.counterArena[key]=JSON.parse(JSON.stringify(COPY.dataCopy.counterArena[key]));
});
DATA.recommendations=COPY.dataCopy.recommendations.map(item=>({...item}));
Object.keys(COPY.dataCopy.externalityNotes).forEach(path=>{
  Object.keys(COPY.dataCopy.externalityNotes[path]).forEach(ext=>{
    if(DATA.externalityMap[path]&&DATA.externalityMap[path][ext]){
      DATA.externalityMap[path][ext].note=COPY.dataCopy.externalityNotes[path][ext];
    }
  });
});

export const ATLAS_SECTIONS=COPY.atlasSections;
export const LIVE_SECTIONS=COPY.liveSections;
export const LIVE_REFERENCE_IDS=["course-rubric","packet-framing","iea-energy-ai","lbnl-report","natick-site","dcd-natick-ended","fcc-public-notice","xinhua-three-body","satcon1-baas","aanda-radio","borlaff-nature-2025","iau-cps","esa-debris"];
export const LIVE_RESPONSE_ROWS=COPY.live.responses.rows;
export const LIVE_UNDERWATER_PROS=COPY.live.underwater.pros;
export const LIVE_UNDERWATER_LIMITS=COPY.live.underwater.limits;
export const LIVE_ORBITAL_PROS=COPY.live.orbital.pros;
export const LIVE_ORBITAL_LIMITS=COPY.live.orbital.limits;
export const LIVE_CONCLUSIONS=COPY.live.conclusion.bullets;

export const PATHWAY_META={
land:{color:"#0f172a",bg:"rgba(15,23,42,0.7)",border:"#334155",text:"#e2e8f0"},
underwater:{color:"#0891b2",bg:"rgba(8,145,178,0.15)",border:"#0891b2",text:"#67e8f9"},
orbital:{color:"#4f46e5",bg:"rgba(79,70,229,0.15)",border:"#6366f1",text:"#a5b4fc"},
astronomy:{color:"#f59e0b",bg:"rgba(245,158,11,0.15)",border:"#f59e0b",text:"#fcd34d"}};

export const EFFECT_META={
none:{color:"#475569",bg:"rgba(71,85,105,0.3)",label:"None",w:"2%"},
low:{color:"#10b981",bg:"rgba(16,185,129,0.5)",label:"Low",w:"25%"},
medium:{color:"#f59e0b",bg:"rgba(245,158,11,0.5)",label:"Medium",w:"55%"},
high:{color:"#f43f5e",bg:"rgba(244,63,94,0.6)",label:"High",w:"90%"},
mixed:{color:"#3b82f6",bg:"rgba(59,130,246,0.5)",label:"Mixed",w:"55%"}};
