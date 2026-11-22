'use strict';
// Six scene-specific architectural studies per BAMBU editorial page.
// Drawn as lightweight, accessible vector linework; no third-party images.
(function initBambuSketchCollections(){
  "use strict";
  const root=document.querySelector("main#main");
  if(!root || document.documentElement.dataset.bambuSketches==="off") return;
  const slug=(location.pathname.split("/").filter(Boolean).pop()||"index.html").replace(/\.html$/,"");
  if(["privacy","brand-review"].includes(slug))return;
  const collections={
    "index":["reception","workstations","meeting","breakout","lighting","joinery"],
    "about":["studio","workstations","meeting","reception","materials","joinery"],
    "tenants":["workstations","meeting","pods","breakout","planning","technology"],
    "landlords":["lobby","structure","planning","glazing","lighting","reception"],
    "operators":["pods","breakout","workstations","meeting","joinery","lighting"],
    "approach":["studio","planning","structure","technology","construction","reception"],
    "material-innovation":["materials","joinery","glazing","lighting","acoustic","reception"],
    "contact":["studio","planning","meeting","reception","materials","workstations"],
    "delivery-network":["structure","technology","planning","construction","lighting","joinery"],
    "workplace-design":["planning","workstations","meeting","pods","breakout","reception"],
    "commercial-fit-out":["construction","structure","glazing","joinery","lighting","reception"],
    "construction-management":["construction","structure","planning","technology","lighting","reception"],
    "furniture-ff-e":["workstations","pods","breakout","joinery","materials","reception"],
    "av-technology":["technology","meeting","lighting","acoustic","pods","planning"],
    "maintenance-aftercare":["structure","technology","joinery","lighting","glazing","workstations"],
    "feasibility":["planning","structure","workstations","lobby","technology","meeting"],
    "licence-to-alter":["planning","glazing","structure","technology","construction","lobby"],
    "office-refurbishment":["workstations","construction","lighting","meeting","joinery","reception"],
    "office-relocation":["planning","workstations","meeting","pods","breakout","reception"],
    "landlord-refurbishment":["lobby","structure","glazing","lighting","reception","planning"],
    "flexible-workspace":["pods","workstations","breakout","meeting","reception","lighting"],
    "project-budgeting":["planning","materials","structure","construction","joinery","technology"],
    "project-programme":["planning","structure","construction","joinery","lighting","reception"],
    "fit-out-guide":["planning","workstations","structure","glazing","lighting","reception"],
    "fitout-readiness":["planning","technology","glazing","construction","workstations","reception"],
    "landlord-readiness":["lobby","planning","structure","glazing","joinery","reception"],
    "lease-decision":["planning","workstations","lobby","structure","meeting","reception"],
    "space-brief":["studio","workstations","meeting","pods","breakout","planning"],
    "working-with-bambu":["studio","planning","meeting","construction","joinery","reception"],
    "project-glossary":["planning","structure","glazing","lighting","workstations","joinery"],
    "journal":["studio","planning","materials","workstations","lighting","reception"],
    "journal-introducing-bambu":["studio","planning","workstations","meeting","materials","reception"],
    "journal-materials-in-use":["materials","joinery","glazing","acoustic","lighting","reception"],
    "journal-read-a-test-fit":["planning","workstations","meeting","pods","breakout","glazing"],
    "materials-lab":["materials","joinery","glazing","lighting","acoustic","technology"],
    "our-work":["planning","reception","workstations","meeting","construction","materials"],
    "concept":["studio","planning","workstations","meeting","reception","lighting"]
  };
  const kinds=collections[slug]||(
    /landlord/i.test(slug)?collections.landlords:
    /office|occupier|tenant/i.test(slug)?collections.tenants:
    /design|furniture|material/i.test(slug)?collections["material-innovation"]:
    /technology|av/i.test(slug)?collections["av-technology"]:
    /management|build|delivery/i.test(slug)?collections["construction-management"]:
    collections.approach
  );
  const hash=(s)=>[...s].reduce((v,c)=>(Math.imul(v,33)+c.charCodeAt(0))>>>0,5381);
  const seed=hash(slug);
  const ink="#776653",warm="#a76d51",bronze="#b49364",soft="#a99b86";
  const line=(x1,y1,x2,y2,o=.52)=>`<path d="M${x1} ${y1}L${x2} ${y2}" opacity="${o}"/>`;
  const rect=(x,y,w,h,o=.5,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" opacity="${o}"/>`;
  const ell=(x,y,rx,ry,o=.5)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" opacity="${o}"/>`;
  function room(v){
    const a=320+(v%4)*27,b=660+(v%3)*22,vanX=920+(v%5)*18,vanY=350+(v%4)*15;
    let s=`<g opacity=".50"><path d="M110 490 L${vanX} ${vanY} L1390 460 M110 85 L${vanX} ${vanY} L1390 78 M${vanX} ${vanY} V810 M110 490 V85 M1390 460 V78" />
      <path d="M110 490 L560 870 L1390 700 L1390 460 M${vanX} ${vanY} L560 870" />
      <path d="M180 440 L1365 325 M260 318 L1330 290 M430 140 L430 500 M650 170 V530" opacity=".23"/></g>`;
    for(let i=1;i<6;i++)s+=line(560+i*128,870-i*27,vanX,vanY,.17);
    for(let i=1;i<6;i++)s+=line(110+i*95,490+i*75,1390,460+i*35,.15);
    s+=`<g opacity=".42"><path d="M${a} 170 L${b} 232 L${b} 496 L${a} 540 Z M${a+22} 199 L${b-23} 250 L${b-23} 475 L${a+22} 514 Z" />
       <path d="M${a+125} 219V519 M${a+235} 234V496 M${a+20} 323L${b-20} 327" /></g>`;
    return s;
  }
  function chair(x,y,scale=1){
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M-31 9 Q-38 -21 -18 -31 Q3 -39 22 -22 L30 10 L19 24 L-23 25Z M-28 12L-37 41L-18 49L29 37L25 15 M-12 48L-15 83 M14 44L20 79 M-15 83L-36 93 M-15 83L7 96 M20 79L44 91 M20 79L5 95" /></g>`;
  }
  function desk(x,y,w=260){
    return `<g transform="translate(${x} ${y})">
      <path d="M0 0 L${w} -62 L${w+115} -7 L110 60Z M26 40 L26 190 M${w+87} 4 L${w+87} 144 M105 61 L105 194" />
      <path d="M${w/2-35} -28 L${w/2+40} -47 L${w/2+61} -35 L${w/2-8} -11Z M${w/2+13} -8 V19 M${w/2-16} 24H${w/2+46}" opacity=".75"/></g>`;
  }
  function subject(kind,v){
    const move=(v%5-2)*14;
    const begin=`<g transform="translate(${move} ${(v%3-1)*12})" stroke-width="2.2" opacity=".88">`;
    let s="";
    if(kind==="workstations"){
      s+=desk(730,490,260)+desk(900,680,190)+chair(840,690,.75)+chair(1150,750,.65);
    } else if(kind==="meeting"){
      s+=`<ellipse cx="1010" cy="615" rx="288" ry="105" transform="rotate(-11 1010 615)"/>
        <path d="M770 635L815 790 M1186 596L1223 760 M910 691V818" />`;
      for(let i=0;i<5;i++)s+=chair(780+i*110,525+(i%2)*40,.65);
      s+=rect(995,255,270,155,.6)+rect(1009,268,244,130,.3);
    } else if(kind==="reception"){
      s+=`<path d="M760 580 Q935 495 1265 560 L1338 634 L1300 781 Q975 713 760 796Z
      M760 580 L760 725 Q992 658 1300 741 M761 616 Q1000 545 1290 626 M786 737 Q1000 673 1273 747" />`;
      s+=`<path d="M890 300L1175 305 M910 345L1143 347 M940 392L1110 388" opacity=".52"/>`;
      s+=ell(1160,476,52,13,.4)+line(1160,270,1160,465,.5);
    } else if(kind==="planning"){
      s+=`<g transform="translate(765 160) rotate(-4 270 260)">
        ${rect(0,0,575,510,.85)}
        <path d="M34 32H542V474H34Z M215 32V205H544 M215 205H34 M350 205V474 M350 355H544 M125 205V365H34 M215 345H350" />
        <path d="M215 155Q265 155 265 205 M350 260Q402 260 402 312 M125 322Q155 322 155 366" stroke-dasharray="6 10"/>
        ${rect(59,67,118,51,.35)}${rect(59,137,118,50,.35)}
        ${rect(390,67,110,55,.35)}${rect(390,137,110,48,.35)}
        ${rect(385,394,113,56,.35)} </g>`;
    } else if(kind==="pods"){
      for(let i=0;i<3;i++){
        const x=700+i*206,y=285+i*29;
        s+=`<g><path d="M${x} ${y}h175v382h-175z M${x+18} ${y+20}h139v345h-139z M${x+26} ${y+160}h124 M${x+35} ${y+244}h100" />
        ${ell(x+86,y+290,45,14,.35)}</g>`;
      }
      s+=chair(1020,755,.6);
    } else if(kind==="breakout"){
      s+=`<path d="M790 575Q800 495 877 495H1120Q1200 490 1215 572V720H780Z M780 623H1215 M810 720V783M1185 720V783
      M839 570H1150 M850 600H965 M980 600H1103" />`;
      s+=ell(1230,740,110,37,.64)+line(1190,740,1170,824)+line(1265,740,1278,811);
      s+=`<path d="M723 488Q716 413 749 387 M713 475Q666 447 676 409 M732 442Q785 410 775 362" opacity=".6"/>`;
    } else if(kind==="lighting"){
      s+=`<g><path d="M580 218L1330 282 M620 239L1305 299 M780 285V433 M1015 307V489 M1215 327V451" />
      ${ell(780,438,83,22,.78)} ${ell(1015,493,105,24,.73)} ${ell(1215,453,75,20,.72)}
      <path d="M790 440V475M1015 497V532M1215 458V488" opacity=".22"/></g>`;
    } else if(kind==="glazing"){
      s+=`<path d="M698 204L1350 277V756L698 825Z M850 223V806 M1034 244V787 M1200 260V768
      M700 445L1350 470 M1055 469V787 M1090 475V781" />`;
      s+=`<path d="M1085 622l-22 9v55l22-8 M735 285L835 300 M889 301L1015 315 M1061 323L1180 340" opacity=".62"/>`;
    } else if(kind==="structure"||kind==="construction"){
      for(let i=0;i<5;i++){let x=685+i*160;s+=`<path d="M${x} 280V815 M${x-19} 286H${x+27} M${x-19} 797H${x+27}" opacity=".65"/>`;}
      for(let y of [331,535,728])s+=line(675,y,1390,y-20,.52);
      s+=`<path d="M695 795L1330 330 M760 283L1310 750" stroke-dasharray="${kind==='construction'?'22 15':'6 12'}"/>`;
      if(kind==="construction")s+=`<path d="M760 756L760 849 M860 755L860 840 M965 741L965 830 M1070 740L1070 821 M1175 734L1175 806" opacity=".5"/>`;
    } else if(kind==="technology"){
      s+=`<path d="M885 262H1310V544H885Z M906 285H1287V521H906Z M1090 544V598M1032 598H1152
      M740 650L987 593L1292 661L1041 743Z M1050 744V832 M1285 663V753 M745 661V760" />`;
      for(let i=0;i<6;i++)s+=`<circle cx="${972+i*45}" cy="${665+i*1.7}" r="5" opacity=".42"/>`;
      s+=`<path d="M1300 260L1368 210M1327 277L1394 229" stroke-dasharray="5 8"/>`;
    } else if(kind==="materials"){
      for(let j=0;j<2;j++)for(let i=0;i<3;i++){
        let x=750+i*187+(j?36:0),y=250+j*260+(i%2)*24;
        s+=`<path d="M${x} ${y}l154 -25l41 147l-156 36Z" opacity=".7"/>`;
        for(let t=0;t<5;t++)s+=line(x+22+t*25,y+28+(t%2)*5,x+80+t*14,y+108+(t%3)*3,.15);
      }
    } else if(kind==="joinery"){
      s+=`<path d="M730 260L1350 290V760L730 816Z M748 280L1330 307V744L748 790Z
      M900 290V778 M1060 298V764 M1190 302V755 M748 525L1330 515 M760 645L1325 633" />`;
      for(let i=0;i<3;i++)s+=rect(930+i*106,345,69,122,.26);
    } else if(kind==="acoustic"){
      for(let i=0;i<9;i++)s+=`<path d="M${745+i*68} 170L${765+i*68} 200L${744+i*68} 488L${724+i*68} 456Z" opacity="${.38+(i%3)*.11}"/>`;
      s+=`<path d="M735 200L1335 245M725 478L1300 520" opacity=".38"/>`;
      s+=desk(805,640,210);
    } else if(kind==="studio"){
      s+=`<path d="M800 650L1215 525L1375 602L934 773Z M806 652L809 672L935 802L1376 626V601" />`;
      s+=`<path d="M895 604L1114 539L1248 600L1025 668Z M945 603L1085 562L1154 597L1014 640Z" opacity=".55"/>`;
      s+=`<path d="M1260 480L1300 395L1324 402L1296 490 M1264 468L1302 474" />`;
      s+=`<path d="M730 300L1024 240L1110 412L822 485Z M740 313L1015 254L1096 405L830 474Z" opacity=".38"/>`;
    } else if(kind==="lobby"){
      s+=`<path d="M750 250L1340 272V770H750Z M770 280L1320 298V750H770Z
        M965 298V750 M1015 299V750 M770 420H1320 M1115 299V420" />`;
      s+=`<path d="M1000 490h200v260h-200z M1158 609l-18 5" opacity=".55"/>`;
      s+=`<path d="M795 725L960 655L980 694L828 770Z" />`;
    } else {
      s+=desk(810,550,220)+chair(1120,710,.7);
    }
    return begin+s+"</g>";
  }
  function drawing(kind,index){
    const variant=((seed%13)+index*7)%17;
    const order=(index%2)?1:0;
    const helper=`<g stroke="${soft}" stroke-width="1.3" opacity=".32" stroke-dasharray="7 13">
      <path d="M${910+variant*8} 96V824 M620 ${188+variant*3}H1370 M${700+variant*3} 835H1385"/>
      <path d="M1320 130h65v65 M600 650h-35v55"/></g>`;
    return `<svg class="bambu-bespoke-frame" style="--bambu-frame:${index}" xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">
      <g fill="none" stroke="${ink}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">
      ${room(variant)}${subject(kind,variant)}
      <g stroke="${bronze}" stroke-width="1.6" opacity=".48">
      ${line(625,845,1360,845,.6)}${line(625,839,625,851,.65)}
      ${line(1360,839,1360,851,.65)}${ell(1360-variant*9,236+variant*5,24,24,.4)}
      </g>
      ${helper}
      <g stroke="${warm}" opacity=".29" stroke-width="1.3">
      <path d="M${660+variant*7} 808L${1190+variant*4} ${380+variant*6} M${680+variant*4} ${860-variant*5}L1365 ${730-variant*3}" stroke-dasharray="2 12"/>
      </g></g></svg>`;
  }
  const home=root.classList.contains("bambu-home");
  const about=root.classList.contains("bambu-company-page");
  let slot,host,mode;
  if(home){
    host=root.querySelector(".home-scene");slot=host?.querySelector(".home-scene-visual");mode="home";
  } else if(about){
    host=root.querySelector(".bambu-company-hero");slot=host?.querySelector(".bambu-architectural-scene__frames");mode="about";
  } else {
    host=root.querySelector(".expertise-opening");
    slot=host?.querySelector(".expertise-scene.sketch-story");
    if(slot)mode="opening";
    else if(slug==="contact"){
      host=root.querySelector(".intro");slot=host?.querySelector(".bambu-contact-drawing");mode="contact";
    } else if(slug==="journal"){
      host=root.querySelector(".journal-intro");slot=host?.querySelector(".journal-opening-art");mode="journal";
    } else {
      host=root.querySelector(":scope > section.intro, :scope > section.bambu-forward-intro, :scope > section.review-hero, :scope > section.journal-intro");
      if(host) {
        slot=document.createElement("div");
        slot.className="bambu-bespoke-scene";
        host.prepend(slot);
        mode="inline";
      }
    }
  }
  if(!slot||!host)return;
  slot.insertAdjacentHTML("beforeend",kinds.map((kind,i)=>drawing(kind,i)).join(""));
  slot.classList.add("bambu-bespoke-ready");
  slot.setAttribute("data-bambu-sketch-mode",mode);
  host.classList.add("bambu-bespoke-host");
  host.setAttribute("data-bambu-bespoke-set",slug);
  if(mode==="about") {
    slot.querySelectorAll("img.bambu-architectural-scene__frame").forEach((img,i)=>{if(i!==0)img.hidden=true;else img.classList.add("bambu-bespoke-photo");});
  }
  if(mode==="home") slot.querySelector(".home-colour-sketch")?.setAttribute("aria-hidden","true");
  // A data-only mark makes it straightforward to check all six unique illustrations in browser QA.
  slot.setAttribute("data-bambu-sketch-count",String(kinds.length));
})();
