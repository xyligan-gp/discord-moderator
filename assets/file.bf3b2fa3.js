import{d as m,h as s,V as d,C as p,o as u,c as f,b as _,q as c,a as h,e as x,f as y}from"./index.405591e8.js";import{m as g,_ as v}from"./SourceButton.0b6cee8b.js";import{u as k}from"./ReducedMotion.afe8e628.js";const w={class:"prose prose-discord dark:prose-light mx-auto py-16 px-4 break-words-legacy sm:px-8 lg:py-8 w-full max-w-4xl lg:max-w-full"},$=["innerHTML"],E=m({setup(B){const r=x(),a=y(),l=s(()=>a.state.docs),n=s(()=>a.state.file),i=s(()=>{var o;const e=(o=l.value)==null?void 0:o.custom[r.params.category].files[r.params.file];if(!e)return;a.commit({type:"setFile",file:e});let t;return e.type==="md"?t=e.content:t=`# ${e.name}
\`\`\`${e.type}
${e.content}
\`\`\``,g(t)});return d({title:s(()=>{var e,t;return`discord-moderator | ${(t=(e=n.value)==null?void 0:e.name)!=null?t:""}`})}),p(()=>{const e=document.getElementById("container");e&&e.scrollTop>200&&e.scrollTo({top:0,behavior:k.value?void 0:"smooth"})}),(e,t)=>{var o;return u(),f("div",w,[_(v,{class:"float-right mt-2",path:(o=c(n))==null?void 0:o.path},null,8,["path"]),h("div",{innerHTML:c(i)},null,8,$)])}}});export{E as default};
