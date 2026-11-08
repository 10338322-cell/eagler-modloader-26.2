"use strict";var wispcraft=(()=>{var ue=Object.defineProperty;var st=Object.getOwnPropertyDescriptor;var ot=Object.getOwnPropertyNames;var it=Object.prototype.hasOwnProperty;var at=(r,e)=>{for(var t in e)ue(r,t,{get:e[t],enumerable:!0})},ct=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of ot(e))!it.call(r,o)&&o!==t&&ue(r,o,{get:()=>e[o],enumerable:!(n=st(e,o))||n.enumerable});return r};var lt=r=>ct(ue({},"__esModule",{value:!0}),r);var qt={};at(qt,{authstore:()=>w,getAuthCode:()=>Ot,getLastUsedAccount:()=>ce,getLoggedInAccounts:()=>ae,setWispUrl:()=>J,showSettingsUI:()=>Dt,wispUrl:()=>I});var L="1.0.0",Ue="vertex-1.0",$="wss://anura.pro/";var ut="https://cdn.jsdelivr.net/npm/qr@0.5.3/+esm";async function xe(r,e,t){try{let n=await import(ut);return(n.default||n.encodeQR)(r,e,t)}catch{return""}}var xt="https://cdn.jsdelivr.net/npm/@mercuryworkshop/epoxy-tls@2.1.19-1/full/epoxy-bundled.js",fe,de,ft,O=null;function pe(){return O||(O=(async()=>{let r=window.__wispcraftEpoxyUrl||xt,e;try{e=await import(r)}catch{throw new Error("couldn't download Wispcraft's network library from cdn.jsdelivr.net. Check your internet connection (or whether a filter blocks that site) and try again.")}await e.default(),fe=e.EpoxyClient,de=e.EpoxyClientOptions,ft=e.EpoxyHandlers})(),O.catch(()=>{O=null})),O}var z=null,Be=!1;function Ie(r){let e=(async()=>{await pe(),Be||(Be=!0,self.Request=new Proxy(self.Request,{construct(n,[o,s]){return new n(o||"about:blank",s)}}));let t=new de;return t.wisp_v2=!1,t.udp_extension_required=!1,new fe(r,t)})();return z=e,e.catch(t=>{console.error("[Wispcraft] could not start the Wisp connection",t),z===e&&(z=null)}),e}function he(){return z||Ie(I)}function Ce(r){J(r),Ie(I).catch(()=>{})}async function _e(){await(await he()).replace_stream_provider()}async function A(r,e){return await(await he()).fetch(r,e)}async function Re(r){return await(await he()).connect_tcp(r)}var Pe="c36a9fb6-4f2a-41ff-90bd-ae7cc92031eb";async function dt(){let e=await(await A("https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:Pe,scope:"XboxLive.signin offline_access"}).toString()})).json(),{device_code:t,user_code:n,verification_uri:o,interval:s}=e;if(!t||!n||!o)throw new Error("Failed to obtain device code information.");return{url:o,code:n,token:(async()=>{let d=null;for(;!d?.access_token;){let h=await(await A("https://login.microsoftonline.com/consumers/oauth2/v2.0/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:Pe,grant_type:"urn:ietf:params:oauth:grant-type:device_code",device_code:t}).toString()})).json();if(h.access_token)d=h;else if(h.error==="authorization_pending")await new Promise(i=>setTimeout(i,s*1e3));else throw new Error(`Polling failed with error: ${h.error}`)}return d.access_token})()}}async function Q(){let r=await dt(),e="https://microsoft.com/link?otc="+r.code,t=await xe(e,"svg",{scale:6,border:1});return{...r,link_url:e,qr_svg:t,qr_svg_uri:`data:image/svg+xml;base64,${btoa(t)}`}}async function pt(r){let t=await(await A("https://user.auth.xboxlive.com/user/authenticate",{headers:{"Content-Type":"application/json",Accept:"application/json"},method:"POST",body:`{
			"Properties": {
				"AuthMethod": "RPS",
				"SiteName": "user.auth.xboxlive.com",
				"RpsTicket": "d=${r}"
			},
			"RelyingParty": "http://auth.xboxlive.com",
			"TokenType": "JWT"
 		}`})).json();if(!t.Token)throw new Error("xbox live did not return a token");return t.Token}async function ht(r){let t=await(await A("https://xsts.auth.xboxlive.com/xsts/authorize",{headers:{"Content-Type":"application/json",Accept:"application/json"},method:"POST",body:JSON.stringify({Properties:{SandboxId:"RETAIL",UserTokens:[r]},RelyingParty:"rp://api.minecraftservices.com/",TokenType:"JWT"})})).json(),n=t.XErr;if(n)switch(n){case 2148916227:throw new Error("xsts says this account is banned from xbox");case 2148916233:throw new Error("xsts says this account does not have a xbox account");case 2148916235:throw new Error("xsts says xbox live is not available in this account's country");case 2148916236:case 2148916237:throw new Error("xsts says this account needs adult verification");case 2148916238:throw new Error("xsts says this account is under 18 and needs to be added to a family");default:throw new Error(`xsts error: ${n}`)}let o=t.Token;if(!o)throw new Error("xsts did not return a token");let s;try{s=t.DisplayClaims.xui[0].uhs}catch{throw new Error("xsts did not return user hash")}return{token:o,userHash:s}}async function gt(r,e){let o=(await(await A("https://api.minecraftservices.com/authentication/login_with_xbox",{headers:{"Content-Type":"application/json",Accept:"application/json"},method:"POST",body:JSON.stringify({identityToken:`XBL3.0 x=${e};${r}`})})).json()).access_token;if(!o)throw new Error("minecraft did not return a token");return o}async function W(r){let t=await(await A("https://api.minecraftservices.com/minecraft/profile",{headers:{Authorization:`Bearer ${r}`}})).json();if(!t.id||!t.name)throw new Error("mc did not return a profile");return t}async function M(r){let e=await pt(r),t=await ht(e);return gt(t.token,t.userHash)}async function Le(r,e,t){let n=await A("https://sessionserver.mojang.com/session/minecraft/join",{headers:{"Content-Type":"application/json"},method:"POST",body:JSON.stringify({selectedProfile:t,serverId:e,accessToken:r})})}var mt=new TextDecoder,g=class r{inner;static new(){return new r(new Uint8Array)}constructor(e,t){e instanceof Uint8Array?t?this.inner=e.slice():this.inner=e:this.inner=Uint8Array.from(e)}copy(){return new r(this.inner.slice())}take(e){if(this.length<e)throw new Error("data too small");let t=this.inner.subarray(0,e);return this.inner=this.inner.subarray(e),new r(t)}resize(e){let t=new Uint8Array(new ArrayBuffer(e));t.set(this.inner),this.inner=t}extend(e){let t=this.inner.length;this.resize(this.inner.length+e.inner.length),this.inner.set(e.inner,t)}get(e){return this.inner[e]}toArray(){return Array.from(this.inner)}toStr(){return mt.decode(this.inner)}get length(){return this.inner.length}readString(){let e=this.readVarInt();return new TextDecoder().decode(this.take(e).inner)}writeString(e){let t=new TextEncoder().encode(e);this.writeVarInt(t.length),this.extend(new r(t))}readUByte(){let e=this.get(0);return this.take(1),e}writeUByte(e){this.extend(new r([e&255]))}readUShort(){let e=this.get(0)<<8|this.get(1);return this.take(2),e}writeUShort(e){this.extend(new r([e>>8,e&255]))}readLong(){let e=0;for(let t=0;t<8;t++)e|=this.get(t)<<t*8;return this.take(8),e}writeLong(e){for(let t=0;t<8;t++)this.extend(new r([e&255])),e>>=8}readVarInt(e=!0){let t=0,n=0,o=0,s;do{if(t>=this.inner.length)throw new Error("data too small");s=this.get(t++),n|=(s&127)<<o,o+=7}while(s>=128);return e&&this.take(t),n}readVariableData(){let e=this.readVarInt();if(!e)throw new Error("data too small");return this.take(e)}writeVarInt(e){let t=[];for(;e>127;)t.push(e&127|128),e>>>=7;t.push(e),this.extend(new r(t))}writeVariableData(e){this.writeVarInt(e.length),this.extend(e)}writeBytes(e){this.extend(new r(e))}};function ge(r,e){return new WritableStream({async write(t,n){r.write(await e(t))},close(){r.close()}})}async function wt(r){let e=new CompressionStream("deflate"),t=e.writable.getWriter();t.write(r.inner),t.close();let n=g.new(),o=e.readable.getReader();for(;;){let{done:s,value:a}=await o.read();if(s||!a)break;n.extend(new g(a))}return n}async function yt(r){let e=new DecompressionStream("deflate"),t=e.writable.getWriter();t.write(r.inner),t.close();let n=g.new(),o=e.readable.getReader();for(;;){let{done:s,value:a}=await o.read();if(s||!a)break;n.extend(new g(a))}return n}function We(){return new TransformStream({transform(r,e){e.enqueue(new g(r))}})}function De(r){return ge(r,e=>e.inner)}function Oe(){let r=g.new(),e=-1;return new TransformStream({transform(t,n){let o=performance.now();for(r.extend(t);;){if(e===-1){let a;try{a=r.readVarInt()}catch{break}e=a}if(r.length<e)break;let s=r.take(e);n.enqueue(s),e=-1}}})}var K=class{compressionThresh=-1;transform;constructor(){let e=this;this.transform=new TransformStream({async transform(t,n){let o=performance.now();if(e.compressionThresh===-1){n.enqueue(t);return}let s=t.readVarInt();if(s>=e.compressionThresh)n.enqueue(await yt(t));else if(s==0)n.enqueue(t);else throw new Error("Decompressor: server sent compressed packet below threshold")}})}},X=class{compressionThresh=-1;async transform(e){if(this.compressionThresh===-1)return e;let t=g.new();if(e.length<this.compressionThresh)t.writeVarInt(0),t.extend(e);else{let n=await wt(e);t.writeVarInt(e.length),t.extend(n)}return t}};function me(r,e,t){return new ReadableStream({async start(n){for(;;){let{done:o,value:s}=await r.read();if(o||!s)break;n.enqueue(s),t()}n.close()}},new CountQueuingStrategy({highWaterMark:e}))}var C=new Uint8Array(256),q=new Uint32Array(256),N=new Uint32Array(256),H=new Uint32Array(256),V=new Uint32Array(256);(function(){let e=new Uint8Array(256),t=new Uint8Array(256),n=1;for(let o=0;o<255;o++)e[o]=n,t[n]=o,n^=n<<1^(n&128?283:0),n&=255;for(let o=0;o<256;o++){let s=o===0?0:e[(255-t[o])%255],a=s;for(let d=0;d<4;d++)s=(s<<1|s>>7)&255,a^=s;C[o]=a^99}for(let o=0;o<256;o++){let s=C[o],a=(s<<1^(s&128?283:0))&255,d=a^s,f=a<<24|s<<16|s<<8|d;q[o]=f>>>0,N[o]=(f>>>8|f<<24)>>>0,H[o]=(f>>>16|f<<16)>>>0,V[o]=(f>>>24|f<<8)>>>0}})();function bt(r){let e=new Uint32Array(44);for(let n=0;n<4;n++)e[n]=(r[4*n]<<24|r[4*n+1]<<16|r[4*n+2]<<8|r[4*n+3])>>>0;let t=1;for(let n=4;n<44;n++){let o=e[n-1];n%4===0&&(o=(C[o>>>16&255]<<24|C[o>>>8&255]<<16|C[o&255]<<8|C[o>>>24])^t<<24,t=(t<<1^(t&128?283:0))&255),e[n]=(e[n-4]^o)>>>0}return e}function St(r,e,t){let n=(e[0]<<24|e[1]<<16|e[2]<<8|e[3])^r[0],o=(e[4]<<24|e[5]<<16|e[6]<<8|e[7])^r[1],s=(e[8]<<24|e[9]<<16|e[10]<<8|e[11])^r[2],a=(e[12]<<24|e[13]<<16|e[14]<<8|e[15])^r[3],d=4;for(let h=1;h<10;h++){let i=q[n>>>24]^N[o>>>16&255]^H[s>>>8&255]^V[a&255]^r[d++],p=q[o>>>24]^N[s>>>16&255]^H[a>>>8&255]^V[n&255]^r[d++],c=q[s>>>24]^N[a>>>16&255]^H[n>>>8&255]^V[o&255]^r[d++],l=q[a>>>24]^N[n>>>16&255]^H[o>>>8&255]^V[s&255]^r[d++];n=i,o=p,s=c,a=l}let f=(h,i,p,c,l,u)=>{let x=(C[h>>>24]<<24|C[i>>>16&255]<<16|C[p>>>8&255]<<8|C[c&255])^l;t[u]=x>>>24,t[u+1]=x>>>16&255,t[u+2]=x>>>8&255,t[u+3]=x&255};f(n,o,s,a,r[40],0),f(o,s,a,n,r[41],4),f(s,a,n,o,r[42],8),f(a,n,o,s,r[43],12)}var Z=class{rk;reg;pos=0;ks=new Uint8Array(16);constructor(e,t){this.rk=bt(e),this.reg=new Uint8Array(4112),this.reg.set(t.subarray(0,16),0)}run(e,t){let n=new Uint8Array(e.length),o=this.rk,s=this.ks,a=this.reg,d=this.pos;for(let f=0;f<e.length;f++){St(o,a.subarray(d,d+16),s);let h=t?e[f]:e[f]^s[0];n[f]=t?e[f]^s[0]:h,d+17>a.length&&(a.copyWithin(0,d,d+16),d=0),a[d+16]=h,d++}return this.pos=d,n}},Y=class extends Z{constructor(e,t,n=1){super(e,t)}encrypt(e){return this.run(e,!1)}},ee=class extends Z{constructor(e,t,n=1){super(e,t)}decrypt(e){return this.run(e,!0)}};function kt(r){function e(y){for(var m=[],b=0;b<=3;b++)m.push(y>>b*8&255);return m}function t(y,m){var b=(y&65535)+(m&65535),S=(y>>16)+(m>>16)+(b>>16);return S<<16|b&65535}function n(y,m){return y<<m|y>>>32-m}function o(y,m,b,S,U,B){return t(n(t(t(m,y),t(S,B)),U),b)}function s(y,m,b,S,U,B,_){return o(m&b|~m&S,y,m,U,B,_)}function a(y,m,b,S,U,B,_){return o(m&S|b&~S,y,m,U,B,_)}function d(y,m,b,S,U,B,_){return o(m^b^S,y,m,U,B,_)}function f(y,m,b,S,U,B,_){return o(b^(m|~S),y,m,U,B,_)}function h(y){var m,b=(y.length+8>>6)+1,S=new Array(b*16);for(m=0;m<b*16;m++)S[m]=0;for(m=0;m<y.length;m++)S[m>>2]|=y.charCodeAt(m)<<m%4*8;return S[m>>2]|=128<<m%4*8,S[b*16-2]=y.length*8,S}var i,p=h(""+r),c=1732584193,l=-271733879,u=-1732584194,x=271733878,T,R,P,k;for(i=0;i<p.length;i+=16)T=c,R=l,P=u,k=x,c=s(c,l,u,x,p[i+0],7,-680876936),x=s(x,c,l,u,p[i+1],12,-389564586),u=s(u,x,c,l,p[i+2],17,606105819),l=s(l,u,x,c,p[i+3],22,-1044525330),c=s(c,l,u,x,p[i+4],7,-176418897),x=s(x,c,l,u,p[i+5],12,1200080426),u=s(u,x,c,l,p[i+6],17,-1473231341),l=s(l,u,x,c,p[i+7],22,-45705983),c=s(c,l,u,x,p[i+8],7,1770035416),x=s(x,c,l,u,p[i+9],12,-1958414417),u=s(u,x,c,l,p[i+10],17,-42063),l=s(l,u,x,c,p[i+11],22,-1990404162),c=s(c,l,u,x,p[i+12],7,1804603682),x=s(x,c,l,u,p[i+13],12,-40341101),u=s(u,x,c,l,p[i+14],17,-1502002290),l=s(l,u,x,c,p[i+15],22,1236535329),c=a(c,l,u,x,p[i+1],5,-165796510),x=a(x,c,l,u,p[i+6],9,-1069501632),u=a(u,x,c,l,p[i+11],14,643717713),l=a(l,u,x,c,p[i+0],20,-373897302),c=a(c,l,u,x,p[i+5],5,-701558691),x=a(x,c,l,u,p[i+10],9,38016083),u=a(u,x,c,l,p[i+15],14,-660478335),l=a(l,u,x,c,p[i+4],20,-405537848),c=a(c,l,u,x,p[i+9],5,568446438),x=a(x,c,l,u,p[i+14],9,-1019803690),u=a(u,x,c,l,p[i+3],14,-187363961),l=a(l,u,x,c,p[i+8],20,1163531501),c=a(c,l,u,x,p[i+13],5,-1444681467),x=a(x,c,l,u,p[i+2],9,-51403784),u=a(u,x,c,l,p[i+7],14,1735328473),l=a(l,u,x,c,p[i+12],20,-1926607734),c=d(c,l,u,x,p[i+5],4,-378558),x=d(x,c,l,u,p[i+8],11,-2022574463),u=d(u,x,c,l,p[i+11],16,1839030562),l=d(l,u,x,c,p[i+14],23,-35309556),c=d(c,l,u,x,p[i+1],4,-1530992060),x=d(x,c,l,u,p[i+4],11,1272893353),u=d(u,x,c,l,p[i+7],16,-155497632),l=d(l,u,x,c,p[i+10],23,-1094730640),c=d(c,l,u,x,p[i+13],4,681279174),x=d(x,c,l,u,p[i+0],11,-358537222),u=d(u,x,c,l,p[i+3],16,-722521979),l=d(l,u,x,c,p[i+6],23,76029189),c=d(c,l,u,x,p[i+9],4,-640364487),x=d(x,c,l,u,p[i+12],11,-421815835),u=d(u,x,c,l,p[i+15],16,530742520),l=d(l,u,x,c,p[i+2],23,-995338651),c=f(c,l,u,x,p[i+0],6,-198630844),x=f(x,c,l,u,p[i+7],10,1126891415),u=f(u,x,c,l,p[i+14],15,-1416354905),l=f(l,u,x,c,p[i+5],21,-57434055),c=f(c,l,u,x,p[i+12],6,1700485571),x=f(x,c,l,u,p[i+3],10,-1894986606),u=f(u,x,c,l,p[i+10],15,-1051523),l=f(l,u,x,c,p[i+1],21,-2054922799),c=f(c,l,u,x,p[i+8],6,1873313359),x=f(x,c,l,u,p[i+15],10,-30611744),u=f(u,x,c,l,p[i+6],15,-1560198380),l=f(l,u,x,c,p[i+13],21,1309151649),c=f(c,l,u,x,p[i+4],6,-145523070),x=f(x,c,l,u,p[i+11],10,-1120210379),u=f(u,x,c,l,p[i+2],15,718787259),l=f(l,u,x,c,p[i+9],21,-343485551),c=t(c,T),l=t(l,R),u=t(u,P),x=t(x,k);return[...e(c),...e(l),...e(u),...e(x)]}function ne(r){let e=kt("OfflinePlayer:"+r);return e[6]=e[6]&15|48,e[8]=e[8]&63|128,e}function j(r){let e="";for(let n=0;n<16;n++){let o=r[n].toString(16).padStart(2,"0");e+=o}return`${e.slice(0,8)}-${e.slice(8,12)}-${e.slice(12,16)}-${e.slice(16,20)}-${e.slice(20)}`}var te=class{aesCfb=null;transform;seed(e){let t=performance.now();this.aesCfb=new ee(e,e,1)}constructor(){this.transform=new TransformStream({transform:(e,t)=>{if(!this.aesCfb){t.enqueue(e);return}let n=performance.now();t.enqueue(new g(this.aesCfb.decrypt(e.inner)))}})}},re=class{aesCfb=null;constructor(){}seed(e){let t=performance.now();this.aesCfb=new Y(e,e,1)}transform(e){if(!this.aesCfb)return e;let t=performance.now();return new g(this.aesCfb.encrypt(e.inner))}};function Me(){let r=new Uint8Array(16);return crypto.getRandomValues(r),r}async function qe(r){let e=await crypto.subtle.importKey("spki",new Uint8Array(r).buffer,{name:"RSA-OAEP",hash:"SHA-256"},!0,["encrypt"]),t=await crypto.subtle.exportKey("jwk",e);function n(o){let s=o.replace(/-/g,"+").replace(/_/g,"/"),a="=".repeat((4-s.length%4)%4),d=s+a,f=atob(d),h=0n;for(let i=0;i<f.length;i++)h=(h<<8n)+BigInt(f.charCodeAt(i));return h}return[n(t.n),n(t.e)]}function we(r,e,t){let n=(f,h,i)=>{let p=1n;for(f=f%i;h>0n;)h%2n===1n&&(p=p*f%i),h=h>>1n,f=f*f%i;return p},s=((f,h)=>{let i=f.length,p=Math.ceil(h.toString(16).length/2);if(i>p-11)throw new Error("Message too long for RSA encryption");let c=p-i-3,l=Array(c).fill(255);return BigInt("0x"+["00","02",...l.map(u=>u.toString(16).padStart(2,"0")),"00",...Array.from(f).map(u=>u.toString(16).padStart(2,"0"))].join(""))})(r,e),d=n(s,t,e).toString(16);return d.length%2&&(d="0"+d),new Uint8Array(Array.from(d.match(/.{2}/g)||[]).map(f=>parseInt(f,16)))}async function Ne(r){let e=new Uint8Array(await crypto.subtle.digest("sha-1",r)),t="";if((e[0]&128)==128){for(let n=0;n<e.length;n++)e[n]^=255,n+1==e.length&&(e[n]+=1);t+="-"}for(let n=0;n<e.length;n++){let o=e[n].toString(16);o.length==1&&(o="0"+o),t+=o}return t}var ye={},be=!1,He=!1;async function vt(r){let e=await r.json(),t=JSON.parse(atob(e.properties[0].value));return{skin:t.textures.SKIN.url,cape:t.textures.CAPE?.url,slim:t.metadata?.model=="slim"}}async function ke(r,e,t){if(!r||He)try{return await A(e)}catch{return new Response}try{return window.fetch("https://crafthead.net/"+(t?"cape":"skin")+"/"+r)}catch{return He=!0,await ke(r,e,t)}}async function Ve(r){let e="",t=!1,n="";try{if(r.startsWith("profile://")){n=r.slice(10);let o=be?"https://sessionserver.mojang.com/session/minecraft/profile/":"https://crafthead.net/profile/",s=await vt(await window.fetch(o+n));r=s.skin,e=s.cape,t=s.slim}return{skin:await Et(await ke(n,r,!1)),cape:e?await Bt(await ke(n,e,!0)):g.new(),slim:t}}catch{return be?{skin:g.new(),cape:g.new(),slim:!1}:(be=!0,await Ve(r))}}function At(r,e){return new OffscreenCanvas(r,e).getContext("2d").getImageData(0,0,r,e)}async function je(r){let e=await createImageBitmap(r),t=new OffscreenCanvas(e.width,e.height),n=t.getContext("2d");return n.drawImage(e,0,0),n.getImageData(0,0,t.width,t.height)}function E(r,e,t,n,o,s,a,d,f,h){let i=t,p=d,c=o,l=n,u=f-a,x=h-d,T=r.width,R=e.width,P=t>o;for(let k=0;k<x;k++)for(let y=0;y<u;y++){let m=(p+k)*T+i+y;P&&(m=(p+k)*T+i+(u-y-1));let b=m*4,S=r.data[b],U=r.data[b+1],B=r.data[b+2],_=r.data[b+3],G=((l+k)*R+c+y)*4;e.data[G]=S,e.data[G+1]=U,e.data[G+2]=B,e.data[G+3]=_}return e}async function Tt(r){let e=await je(r);if(e.height!=64){let s=At(64,64);for(let a=0;a<e.data.length;a++)s.data[a]=e.data[a];s=await E(e,s,24,48,20,52,4,16,8,20),s=await E(e,s,28,48,24,52,8,16,12,20),s=await E(e,s,20,52,16,64,8,20,12,32),s=await E(e,s,24,52,20,64,4,20,8,32),s=await E(e,s,28,52,24,64,0,20,4,32),s=await E(e,s,32,52,28,64,12,20,16,32),s=await E(e,s,40,48,36,52,44,16,48,20),s=await E(e,s,44,48,40,52,48,16,52,20),s=await E(e,s,36,52,32,64,48,20,52,32),s=await E(e,s,40,52,36,64,44,20,48,32),s=await E(e,s,44,52,40,64,40,20,44,32),s=await E(e,s,48,52,44,64,52,20,56,32),e=s}let n=new Uint8Array(16384),o=e.data;for(let s=1;s<64**2;s++){let a=s*4;n[a]=o[a+3],n[a+1]=o[a+2],n[a+2]=o[a+1],n[a+3]=o[a]}return n}async function Et(r){return new g(await Tt(await r.blob()))}async function Ut(r){let e=new Uint8Array(1173),t=(await je(r)).data,n,o;for(let s=0;s<17;++s)for(let a=0;a<22;++a)n=s*32+a<<2,o=(s*23+a)*3,e[o]=t[n+1],e[o+1]=t[n+2],e[o+2]=t[n+3];for(let s=0;s<11;++s)n=(s+11)*32+22<<2,o=((s+6)*23+22)*3,e[o]=t[n+1],e[o+1]=t[n+2],e[o+2]=t[n+3];return e}async function Bt(r){return new g(await Ut(await r.blob()))}async function Se(r){if(!ye[r]){let t=await Ve(r);if(t.skin.length==0)return t;ye[r]=t}return ye[r]}async function Fe(r,e){let t=e.take(1).get(0);if(r){if(t==3){let n=e.take(16),o=j(n.toArray()),s=(await Se("profile://"+o)).cape;if(s.length==0)return g.new();let a=g.new();return a.writeBytes([5]),a.extend(n),a.extend(s),a}}else if(t==3){let n=e.take(16),o=j(n.toArray()),s=await Se("profile://"+o),a=s.slim,d=s.skin;if(d.length==0)return g.new();let f=g.new();return f.writeBytes([5]),f.extend(n),f.writeBytes([a?1:0]),f.extend(d),f}else if(t==6){let n=e.take(16),o=new TextDecoder().decode(e.take(e.take(2).readUShort()).inner);if(new URL(o).hostname!="textures.minecraft.net")return g.new();let s=await Se(o),a=!1,d=s.skin;if(d.length==0)return g.new();let f=g.new();return f.writeBytes([5]),f.extend(n),f.writeBytes([a?1:0]),f.extend(d),f}return g.new()}var Je=(i=>(i[i.Handshake=0]="Handshake",i[i.EAG_ClientVersion=1]="EAG_ClientVersion",i[i.EAG_RequestLogin=4]="EAG_RequestLogin",i[i.EAG_ProfileData=5]="EAG_ProfileData",i[i.EAG_FinishLogin=8]="EAG_FinishLogin",i[i.StatusRequest=0]="StatusRequest",i[i.PingRequest=1]="PingRequest",i[i.LoginStart=0]="LoginStart",i[i.EncryptionResponse=1]="EncryptionResponse",i[i.PluginMessage=-0]="PluginMessage",i))(Je||{}),Qe=(e=>(e[e.PluginMessage=23]="PluginMessage",e))(Qe||{}),Ke=(e=>(e[e.PluginMessage=9]="PluginMessage",e))(Ke||{}),Xe=(c=>(c[c.EAG_ServerVersion=2]="EAG_ServerVersion",c[c.EAG_AllowLogin=5]="EAG_AllowLogin",c[c.EAG_FinishLogin=9]="EAG_FinishLogin",c[c.EAG_Disconnect=255]="EAG_Disconnect",c[c.StatusResponse=0]="StatusResponse",c[c.PongResponse=1]="PongResponse",c[c.Disconnect=0]="Disconnect",c[c.EncryptionRequest=1]="EncryptionRequest",c[c.LoginSuccess=2]="LoginSuccess",c[c.SetCompression=3]="SetCompression",c[c.SetCompressionPlay=70]="SetCompressionPlay",c[c.PluginMessage=-0]="PluginMessage",c))(Xe||{}),Ze=(e=>(e[e.PluginMessage=63]="PluginMessage",e))(Ze||{}),Ye=(e=>(e[e.PluginMessage=24]="PluginMessage",e))(Ye||{}),v=class extends g{constructor(e){super(new Uint8Array),this.writeVarInt(e)}},Ge={black:"0",dark_blue:"1",dark_green:"2",dark_aqua:"3",dark_red:"4",dark_purple:"5",gold:"6",gray:"7",dark_gray:"8",blue:"9",green:"a",aqua:"b",red:"c",light_purple:"d",yellow:"e",white:"f"};function se(r){let e="\xA7",t="";if(r.color&&Ge[r.color]&&(t+=e+Ge[r.color]),r.bold&&(t+=e+"l"),r.italic&&(t+=e+"o"),r.underlined&&(t+=e+"n"),t+=r.text??"",r.extra)for(let n=0;n<r.extra.length;n++)t+=se(r.extra[n]);return t}function F(r){return r>=764}function $e(r){let e=r.replace(/-/g,""),t=[];for(let n=0;n<32;n+=2)t.push(parseInt(e.slice(n,n+2),16)||0);return t}function It(r){try{let e=JSON.parse(r);return typeof e=="string"?e:Array.isArray(e)?e.map(t=>typeof t=="string"?t:se(t)).join(""):se(e)}catch{return r}}function ze(r){let e=g.new(),t=new TextEncoder().encode(r);return e.writeBytes([255,8]),e.writeUShort(t.length),e.extend(new g(t)),e}function Ct(r){return r<256?[0,r]:[r>>8&255,r&255]}function ve(r,e,t){return e==1?r==47?Qe[t]:r==340?Ke[t]:Je[t]:r==47?Ze[t]:r==340?Ye[t]:Xe[t]}var oe=class{constructor(e,t,n,o,s){this.serverAddress=n;this.serverPort=o;this.authStore=s;this.net=t,this.eagler=e}serverAddress;serverPort;authStore;loggedIn=!1;handshook=!1;decompressor=new K;compressor=new X;decryptor=new te;encryptor=new re;state=0;net;eagler;offlineUsername="";offlineUuid="";isPremium=!1;protocol=-1;async eaglerRead(e){switch(e=new g(e.inner),this.state){case 0:switch(e.readVarInt()){case 1:e.readUByte();let n=e.readUShort();for(let h=0;h<n;h++)e.readUShort();e.readUShort(),this.protocol=e.readUShort();let o=new v(2);{let h=new TextEncoder().encode("Wispcraft");o.writeBytes([0,3,...Ct(this.protocol),h.length]),o.extend(new g(h)),o.writeBytes([h.length]),o.extend(new g(h)),o.writeBytes([0,0,0])}this.eagler.write(o);return;case 4:let s=e.readString();this.offlineUsername=s;let a=new v(5);this.authStore.user?(a.writeString(this.authStore.user.name),a.writeBytes($e(this.authStore.user.id))):(a.writeString(this.offlineUsername),a.writeBytes(ne(this.offlineUsername))),this.eagler.write(a);return;case 8:this.state=2;let d=new v(0);d.writeVarInt(this.protocol),d.writeString(this.serverAddress),d.writeUShort(this.serverPort),d.writeVarInt(2),this.net.write(d);let f=new v(0);this.authStore.user?(f.writeString(this.authStore.user.name),F(this.protocol)&&f.writeBytes($e(this.authStore.user.id))):(f.writeString(this.offlineUsername),F(this.protocol)&&f.writeBytes(ne(this.offlineUsername))),this.net.write(f);break}break;case 1:break;case 2:case 3:if(F(this.protocol)){this.state===3&&this.net.write(e);break}switch(e.readVarInt(!1)){case ve(this.protocol,1,"PluginMessage"):let n=e.copy();n.readVarInt();let o=n.readString();if(o.startsWith("EAG|")){if(o=="EAG|Skins-1.8"||o=="EAG|Capes-1.8"){let s=o[4]=="C",a=n.take(n.length);Fe(s,a).then(d=>{if(d.length==0)return;let f=new v(ve(this.protocol,0,"PluginMessage"));f.writeString(o),f.extend(d),this.eagler.write(f)})}break}default:this.net.write(e);break}}}async epoxyRead(e){e=new g(e.inner);let t;switch(this.state){case 0:break;case 1:switch(t=e.readVarInt(),t){case 0:let n=e.readString(),o=JSON.parse(n),s={name:"Java Server",brand:"mercuryworkshop",vers:"wispcraft/"+L,cracked:!0,time:Date.now(),uuid:j(ne("wispcraft")),type:"motd",data:{cache:!1,icon:!1,online:o.players.online,max:o.players.max,players:[o.version.name,"\xA77\xA7o(Wispcraft)"]}};if(o.description&&(typeof o.description=="string"?s.data.motd=[o.description]:o.description.extra?s.data.motd=[se(o.description)]:s.data.motd=[o.description.text]),o.favicon&&(s.data.icon=!0),this.eagler.write(JSON.stringify(s)),o.favicon){let d=await createImageBitmap(await(await fetch(o.favicon)).blob()),f=new OffscreenCanvas(d.width,d.height),h=f.getContext("2d");h.drawImage(d,0,0);let i=h.getImageData(0,0,f.width,f.height).data;this.eagler.write(new g(new Uint8Array(i)))}break;case 1:let a=e.readLong();break;default:console.error("Unhandled status packet: "+t)}break;case 2:switch(t=e.readVarInt(),t){case 0:{let s=e.readString();console.error("Disconnect during login: "+s);let a=It(s),d=ze(a);this.eagler.write(d)}break;case 2:F(this.protocol)?await this.net.write(new v(3)):this.offlineUuid=e.readString(),this.state=3;let n=new v(9);this.eagler.write(n);break;case 4:{let s=e.readVarInt(),a=new v(2);a.writeVarInt(s),a.writeBytes([0]),this.net.write(a);break}case 5:{let s=e.readString(),a=new v(4);a.writeString(s),a.writeBytes([0]),this.net.write(a);break}case 3:let o=e.readVarInt();this.decompressor.compressionThresh=o,this.compressor.compressionThresh=o;break;case 1:{if(this.isPremium=!0,this.authStore.user==null){let T=ze(`This server requires authentication, but you are not logged in!
 Connect to Wispcraft Settings to log in with Microsoft`);this.eagler.write(T);return}let s=e.readString(),a=e.readVariableData(),d=e.readVariableData(),f=Me(),h=await Ne(new Uint8Array([...new TextEncoder().encode(s),...f,...a.inner])),[i,p]=await qe(a.inner),c=we(f,i,p),l=we(d.inner,i,p);await Le(this.authStore.yggToken,h,this.authStore.user.id);let u=new v(1);u.writeVariableData(new g(c)),u.writeVariableData(new g(l)),this.net.write(u).then(()=>{this.encryptor.seed(f),this.decryptor.seed(f)})}break;default:console.error("Unhandled login packet: "+t)}break;case 3:if(F(this.protocol)){this.eagler.write(e);break}switch(e.readVarInt(!1)){case 70:if(this.protocol==47){e.readVarInt();let s=e.readVarInt();this.decompressor.compressionThresh=s,this.compressor.compressionThresh=s;break}case ve(this.protocol,0,"PluginMessage"):let n=e.copy();if(n.readVarInt(),n.readString().startsWith("EAG|"))break;default:this.eagler.write(e)}}}async ping(){let e=new v(0);e.writeVarInt(47),e.writeString(this.serverAddress),e.writeUShort(this.serverPort),e.writeVarInt(1),this.net.write(e);let t=new v(0);this.net.write(t);let n=new v(1);n.writeLong(Date.now()),this.net.write(n),this.state=1}};function et(){let r,e;return[new ReadableStream({start(t){r=t},cancel(){e.error("other side closed")}}),new WritableStream({start(t){e=t},write(t){r.enqueue(t)},close(){r.close()}})]}var ie=class{constructor(e,t){this.authStore=t;let[n,o]=et();this.processIn=n.getReader(),this.eaglerIn=o.getWriter();let[s,a]=et();if(this.eaglerOut=s.getReader(),this.processOut=a.getWriter(),this.url=new URL(e.slice(e.toLowerCase().indexOf("://")+3)),this.url.port||(this.url.port="25565"),this.url.protocol!="java:")throw new Error("invalid protocol")}authStore;eaglerIn;eaglerOut;processIn;processOut;url;impl;rawEpoxy;closed=!1;conn;close(){if(!this.closed){this.closed=!0;try{this.rawEpoxy?.close().catch(()=>{})}catch{}try{this.conn?.read?.cancel?.().catch?.(()=>{})}catch{}try{this.processOut.close().catch(()=>{})}catch{}}}async forward(e){let t;try{let d=await(await A(`https://cloudflare-dns.com/dns-query?name=_minecraft._tcp.${this.url.hostname}&type=SRV`,{headers:{Accept:"application/dns-json"}})).json();if(d.Answer?.length){let f=d.Answer[0].data.split(" "),h=f[2],i=f[3];t=new URL(`java://${i}:${h}`)}}catch{}let n=await Re(t?t.host:this.url.host);this.conn=n,e();let o=De(n.write.getWriter());this.rawEpoxy=o.getWriter();let s=new oe(this.processOut,ge(this.rawEpoxy,async a=>{let d=await s.compressor.transform(a),f=g.new();return f.writeVarInt(d.length),f.extend(d),s.encryptor.transform(f)}).getWriter(),this.url.hostname,this.url.port?parseInt(this.url.port):25565,this.authStore);(async()=>{let a=0,d=me(n.read.pipeThrough(We()).pipeThrough(s.decryptor.transform).pipeThrough(Oe()).pipeThrough(s.decompressor.transform).getReader(),100,()=>a++).getReader();try{for(;;){let{done:f,value:h}=await d.read();if(f||!h)break;try{await s.epoxyRead(h)}catch(i){console.error("[Wispcraft] server packet",i)}a--}}catch(f){console.error("[Wispcraft] server stream",f)}this.close()})(),(async()=>{let a=0,d=me(this.processIn,100,()=>a++).getReader();try{for(;;){let{done:f,value:h}=await d.read();if(f||!h)break;try{await s.eaglerRead(h)}catch(i){console.error("[Wispcraft] client packet",i)}a--}}catch{}this.close()})(),this.impl=s}ping(){this.impl?.ping()}};var tt="data:image/png;base64,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";function Rt(r){return r instanceof Element&&!!r.closest(".settings-ui, .backdrop-blur")}for(let r of["keydown","keyup","keypress","mousedown","mouseup","wheel","contextmenu"])window.addEventListener(r,e=>{Rt(e.target)&&e.stopImmediatePropagation()},!0);function Pt(){let r=`
      	<style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&family=Rajdhani:wght@700&display=swap');

            .backdrop-blur {
                display: "block";
                width: 100vw;
                height: 100vh;
                position: fixed;
                z-index: 2147483600;
                top: 0;
                left: 0;

                background-color: rgba(0, 0, 0, 0.5);
            }

            .settings-ui {
                width: 80vw;
                height: 80vh;
                position: fixed;
                z-index: 2147483601;

                background-color: #020817;
                border-radius: 1rem;
                border: 1px solid #1E293B;
                color: #F8FAFC;
                font-family: "Inter";

                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);

                display: flex;
                flex-direction: column;
            }

            .settings-ui * {
                margin: 0;
                padding: 0;
            }

            .header {
                padding: 1rem;
                display: flex;

                align-items: center;
                justify-content: space-between;
            }

            .header .side {
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .header #close {
                cursor: pointer;
            }

            .header h1 {
                font-family: "Rajdhani";
            }

            .header img {
                height: 3rem;
                width: 3rem;
            }

            .settings-ui .tabs {
                padding: 0rem 1rem;
                display: flex;
                align-items: start;
                gap: 2rem;

                border-bottom: 1px solid #313244;
            }

            .settings-ui span {
                cursor: pointer;
            }

            .settings-ui span.selected {
                border-bottom: 2.5px solid #cdd6f4;
                padding-bottom: 6px;
            }

            .content {
                display: flex;
                flex-direction: column;
                flex: 1;

                overflow-y: scroll;

                padding: 1rem;

                gap: 1.25rem;
            }

            .settings-ui .setting {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .hidden {
                display: none;
            }

            .settings-ui .input {
                background-color: #020817;
                color: #cdd6f4;
                border: 1px solid #1E293B;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 14px;
                transition: all 0.2s ease;
            }

            .settings-ui .input:focus {
                outline: none;
            }

            .settings-ui .input::placeholder {
                color: #6c7086;
            }

            .settings-ui .checkbox-wrapper {
                position: relative;
                display: inline-block;
            }

            .settings-ui .checkbox-wrapper input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }

            .settings-ui .checkbox-mark {
                position: absolute;
                height: 18px;
                width: 18px;
                background-color: #1E293B;
                border: 1px solid #1E293B;
                border-radius: 4px;
                transition: all 0.2s ease;
            }

            .settings-ui .checkbox-wrapper input:checked ~ .checkbox-mark {
                background-color: #3C82F5;
            }

            .settings-ui .checkbox-mark:after {
                content: "";
                position: absolute;
                display: none;
            }

            .settings-ui .checkbox-wrapper input:checked ~ .checkbox-mark:after {
                display: block;
            }

            .settings-ui .checkbox-wrapper .checkbox-mark:after {
                left: 6px;
                top: 2.25px;
                width: 3px;
                height: 8px;
                border: solid #1e1e2e;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }

            .settings-ui .select {
                background-color: inherit;
                color: #cdd6f4;
                border: 1px solid #313244;
                border-radius: 6px;
                padding: 8px 32px 8px 12px;
                font-size: 14px;
                cursor: pointer;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='%236c7086' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
            }

            .settings-ui .select option {
                background-color: #020817;
                color: #cdd6f4;
            }

            .settings-ui .select:focus {
                outline: none;
            }

            .settings-ui .action {
                display: flex;
                flex-direction: row;
                gap: 0.5rem;
            }

            .settings-ui .action .button {
                background-color: #3C82F6;
                color: #0F172A;
                border: 1px solid #1E293B;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 14px;
                height: 37px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex: 1;
            }

            .settings-ui .action .button:hover {
                background-color: rgba(57 128 242, 0.9);
            }

            .settings-ui .action .button:focus {
                outline: none;
            }

            .settings-ui #account_status {
                text-align: center;
            }

            .settings-ui #save_status {
                font-size: 14px;
                color: #cdd6f4;
            }

            .settings-ui #account_status svg {
                background-color: #cdd6f4;
                color: #020817;
                border: 1px solid #1E293B;
                border-radius: 6px;
                padding: 8px 8px;
                width: 148px;
                height: 148px;
                transition: all 0.2s ease;
            }

            .settings-ui #account_status svg:hover {
                background-color: #ffffff;
                color: #000000;
            }

            .settings-ui #account_status a {
                color: #3C82F6;
            }

            .settings-ui #account_status a:active {
                color: #cdd6f4;
            }

            .link {
                color: #3C82F6;
            }
            
            .list{
              padding-left: 2em;
            }
            
            .value {
              width: 3.5em;
              padding: 4px 2px;
              margin: -4px 0;
              text-align:center;
            }

        </style>

        <div class="backdrop-blur hidden" id="backdrop_blur"></div>

        <div class="settings-ui hidden" id="settings_ui">
            <div class="header">
                <div class="side">
                    <img src="${tt}">
                    <h1>Wispcraft</h1>
                </div>

                <div class="side" style="padding-right:1rem;color:rgba(248,250,252,0.8);">
                    <svg id="close" onclick="document.querySelector('.settings-ui').classList.add('hidden');document.querySelector('.backdrop-blur').classList.add('hidden');" xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="currentColor" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </div>
            </div>

            <div class="tabs">
                <span class="selected" id="settings_tab">Settings</span>
                <span id="about_tab">About</span>
            </div>

            <div class="content shown" id="settings">
                <div class="setting">
                    <p>Wisp Server</p>
                    <input class="input" id="wisp_url" placeholder="${$}" value="${I}" />
                    <p id="save_status"><br /></p>
                    <p>Microsoft Accounts</p>
                    <select name="accounts" id="account_select" class="select">
                        <option selected disabled>Choose an account</option>
                        <option value="no-account">NONE</option>
                    </select>
                    <p id="account_status"></p>
                    <div class="action">
                        <button class="button" id="addbutton">Add an account</button>
                        <button class="button" id="removebutton" disabled>Remove account</button>
                    </div>
                </div>
            </div>

            <div class="content hidden" id="about">
                <div class="setting">
                  <p>Wispcraft uses the <a class="link" href="https://github.com/MercuryWorkshop/wisp-protocol">Wisp protocol</a> to let Eaglercraft connect to regular Java Minecraft servers. To join one, open Multiplayer \u2192 Direct Connection (or Add Server), click <b>Wisp</b> under the address, and type the server address as normal. To join an Eaglercraft server, choose <b>EaglerX</b> instead.</p>
                  <br>
                  <p>Warnings:</p>
                  <ul class="list">
                    <li>Connecting to a cracked Minecraft server over Wisp gives the Wisp server access to chat logs, map data, etc..</li>
                    <li>Using your Minecraft account on Wispcraft may lead to a server taking action on your account.  </li>
                  </ul>
                </div>
            </div>
        </div>`;document.body.insertAdjacentHTML("beforeend",r);let e=document.querySelector("#settings"),t=document.querySelector("#about"),n=document.querySelector("#settings_tab"),o=document.querySelector("#about_tab"),s=document.querySelector("#wisp_url"),a=document.querySelector("#save_status"),d=document.querySelector("#account_select"),f=document.querySelector("#addbutton"),h=document.querySelector("#removebutton"),i=document.querySelector("#account_status");if(localStorage.wispcraft_wispurl&&(s.value=localStorage.wispcraft_wispurl),localStorage.wispcraft_accounts){let l=ae();if(l)for(let u of l){let x=document.createElement("option");x.value=u.username,x.innerText=u.username,d.add(x)}}localStorage.wispcraft_last_used_account&&(d.value=localStorage.wispcraft_last_used_account);let p=-1;s.onchange=async()=>{p!=-1&&(clearTimeout(p),p=-1);try{let l=s.value;localStorage.setItem("wispcraft_wispurl",l),Ce(l),await _e(),a.innerText="Wisp server set successfully!"}catch(l){a.innerText=`An error occured: ${new String(l).toString()}`}p=setTimeout(()=>{a.innerHTML="<br />"},5e3)},o.onclick=()=>{let l=document.querySelectorAll(".tabs span"),u=document.querySelectorAll(".settings-ui .content");for(let x of l)x.classList.remove("selected");for(let x of u)x.classList.remove("shown"),x.classList.add("hidden");t.classList.remove("hidden"),t.classList.add("shown"),o.classList.add("selected")},n.onclick=()=>{let l=document.querySelectorAll(".tabs span"),u=document.querySelectorAll(".settings-ui .content");for(let x of l)x.classList.remove("selected");for(let x of u)x.classList.remove("shown"),x.classList.add("hidden");e.classList.remove("hidden"),e.classList.add("shown"),n.classList.add("selected")},d.onchange=async()=>{if(d.value==="no-account"){w.user=null,w.yggToken="",localStorage.wispcraft_last_used_account="no-account",h.disabled=!0;return}let l=ce();if(l)try{try{w.msToken=l.ms,w.yggToken=l.token,w.user=await W(w.yggToken)}catch{w.yggToken=await M(w.msToken),w.user=await W(w.yggToken)}localStorage.wispcraft_last_used_account=w.user.name,h.disabled=!1;return}catch(u){console.error(u),c()}d.value="no-account",w.user=null,w.yggToken="",localStorage.wispcraft_last_used_account="no-account",h.disabled=!0};let c=()=>{if(d.value==="no-account")return;let l=localStorage.wispcraft_accounts;if(!l)return;let u=JSON.parse(l),x=u.findIndex(T=>T.username===d.value);x!=-1&&(u.splice(x,1),localStorage.wispcraft_accounts=JSON.stringify(u),d.remove(d.selectedIndex))};h.onclick=c,f.onclick=async()=>{try{f.disabled=!0;let l=await Q();i.innerHTML=`Scan QR Code or click <a id="mslink" href="javascript:void(0)" target="_blank">this link</a> and use code <input id="auth_code" class="input" style="width:8em;text-align:center;" type="text" readonly value="${l.code}" /> for logging in.<br /><br />${l.qr_svg}<br />`;let u=document.querySelector("#auth_code");u.onclick=()=>{u.select(),u.setSelectionRange(0,u.value.length),navigator.clipboard.writeText(u.value)},i.querySelector("#mslink").onclick=async()=>{let k=window.open(l.link_url,"","height=500,width=350");await l.token,k?.close()},await l.token,i.innerHTML="Authenticating...";let x=await l.token;w.msToken=x,w.yggToken=await M(w.msToken),w.user=await W(w.yggToken);let T=localStorage.wispcraft_accounts,R={username:w.user.name,token:w.yggToken,ms:w.msToken};if(!T)localStorage.wispcraft_accounts=JSON.stringify([R]);else{let k=JSON.parse(T),y=k.findIndex(m=>m.username===w.user?.name);y!=-1?k.splice(y,1,R):k.push(R),localStorage.wispcraft_accounts=JSON.stringify(k)}let P=document.createElement("option");P.value=w.user.name,P.innerText=w.user.name,d.add(P),i.innerHTML="",d.value=w.user.name,f.disabled=!1,localStorage.wispcraft_last_used_account=w.user.name}catch(l){i.innerHTML=`An error occured: <code>${new String(l).toString()}</code>`,f.disabled=!1}},localStorage.seen_about||(o.click(),localStorage.seen_about=1)}function D(){let r=document.querySelector(".settings-ui");if(!r)return Pt(),D();r.classList.remove("hidden"),document.querySelector(".backdrop-blur").classList.remove("hidden"),document.exitFullscreen().catch(()=>{})}var rt="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAEtElEQVR4AeybX2wMQRzHr0cfWmnvaDTSEIkXLxKCxDOekIi/JYQQESIRkRAiEkVIeOMJ8S9ISEtEpPVEvOCBaBPpU5HwohHV9nptUml7PrPtbu7mZnuduaXbm5Xf93bmN7/Zme93fjt3u1vx2Ni/TCYzra+vb2sqlWoBv0CmxCA4NcNxi+A6RjvmCNDZ2TmDhuc0NNKwBtSAUjPBaS0cmwRXwVkQdASorKy8T0UQ52CFramoqLgtmMZJ840UBDjYY2VlZfVw3yAy4LA9tHOZIsIhIcCSXLc9NfaD5UKAhD2U85gmhAACeS2WOOI2k3fWOBLAkcHijygDLF58h3qUAY4MFn9YlwHyWkcCyIrYVjfNgD6E2g/2ZuE1ZT/7QcM+4MVzI9JKfdLNSABuIzuqq6tvgrsuYNIC/KyVuNvAi+ccr/yC/6ffSABWL6OYpMqnCAuXy0iAcFEobjaRACb6cf2WKfqpfIqwwi7OPwAecqmd43iQHt7m6VM+gf8P0LbQZQCkG0dGRuZVVVXtSCQSZzhez948fcqX6deuzZ4OQQoQxCbYDOlt4Ddz07J4PG40vpEAqG00WCFGrHxDoZig240E4LpUXe8qn858PyWTyQ/ZHRB6Om9xNoPTvb29DS56enqWZscVUzYSQDVgeXm5eK3mt1ldVPSRBfssx0D8GCI8BucR/YwL0n21HGtaD0wAXjV989mgxK+/N4oJypfRTzkG4v/8nYWRAExMnrw8d+266pysuN/8AhvfbwBtAmHtUGheRgKwMvL1G+vv71/mblLykWt5U6GJaLbnja/Z3ws3EkCVrsPDwysRxtuossvEi1thb9AACpN7CUBOtQIqXwBclacYUXoNnEYZYDBOwS4qUfENqTqSUeIBi6pJ2xcaAZj5HJBjEH2Z4xitdAwNDTWPFov/DJMAK2Q6/K64RRYsQojdtO2lXJ9Op5fU1NSkqAdiRgIwIdUmpPLpTHIO3xaL5A7cDbZzc3QfMe5SbqqrqxuQY4qpGwlQzIDj9UXYK+O1u22pVGqhWy72aCQAqaja8VU+3fmtIgse8DtilqojAok/6jpF23oQiBkJwESmKUZX+ZwwBMtrwzfdaZQ+OPdO2r6zys/ABcRw7gIpX0Ocr4RfAIGZkQCMvpiJPWRSd1zgOwKUBqlVxN0DXjy+PcrgUecMDmKVTyGG8+OK+gEwH8Tom/f4i2cJRlyMOolJMLHtHAUJF3lfY7S7Vk5hF3BjxdH4j7MY+z3nyjF8M3McE6wYCzDB85uE3WOFz6rAyU6y0sv4RnhL2TOyUewZ8zyHRiF0ArCSx/naa1AB4peSyeRHmR8PSEQ2GnEx6iRPYDLrXV1dc8kW42eJU1oANtX1PIp7xwLMBo7pfoROAFbzJMT2+IHr/TBfhw9o/wLZZ2AuMLbQCQCTo+COH9gjriLSTtoXgKItjAIUTUrnBJEAOmqVYmyUAaW4qjqcogzQUasUY6MMYFW7ga3WLTKgzVb28G6L89PyBgUrDe7X4jxqfgT7p8Aq436iEe6N4hKIURAvHp5YpEDT4OCg88LWEYBUSPO0Rfy38nWIIP7mt4vjlDCNSQpOL1j5tXCtr62tTYu+fwEAAP//Gn4IpQAAAAZJREFUAwCd0aq3dO5/XAAAAABJRU5ErkJggg==";function Wt(r){let e=new TextEncoder().encode(r).slice(0,255);return Uint8Array.from([255,8,e.length,...e])}var le=class extends EventTarget{onopen=null;onmessage=null;onclose=null;onerror=null;binaryType="arraybuffer";bufferedAmount=0;extensions="";protocol="";readyState=WebSocket.CONNECTING;url="";CONNECTING=0;OPEN=1;CLOSING=2;CLOSED=3;dispatchEvent(e){let t=super.dispatchEvent(e),n=this["on"+e.type];if(typeof n=="function")try{n.call(this,e)}catch(o){console.error(o)}return t}emitMessage(e){let t;typeof e=="string"?t=e:t=e.slice().buffer,this.dispatchEvent(new MessageEvent("message",{data:t}))}emitClose(e=1e3){this.readyState!==WebSocket.CLOSED&&(this.readyState=WebSocket.CLOSED,this.dispatchEvent(new CloseEvent("close",{code:e,wasClean:e===1e3})))}},Te=class extends le{inner;constructor(e){super(),this.url=e,this.inner=new ie(e,w)}start(){this.inner.forward(()=>{this.readyState=WebSocket.OPEN,this.dispatchEvent(new Event("open"))}).catch(e=>{console.error("[Wispcraft] connection failed",e),this.dispatchEvent(new Event("error")),this.emitClose(1006)}),(async()=>{try{for(;;){let{done:e,value:t}=await this.inner.eaglerOut.read();if(e||!t)break;this.emitMessage(typeof t=="string"?t:t.inner)}this.emitClose(1e3)}catch(e){console.error(e),this.dispatchEvent(new Event("error")),this.emitClose(1006)}})()}send(e){let t;if(typeof e=="string"){e.toLowerCase()=="accept: motd"&&this.inner.ping();return}else if(e instanceof ArrayBuffer)t=new g(new Uint8Array(e.slice(0)),!0);else if(ArrayBuffer.isView(e))t=new g(new Uint8Array(e.buffer,e.byteOffset,e.byteLength).slice(),!0);else return;if(this.url.includes("hypixel.net")&&!localStorage.disclaimer_accepted){if(!window.confirm("WARNING: Wispcraft in default configuration will route your traffic through a VPN. This is not officially supported by hypixel, and in the possible event your account gets locked we do not accept responsibility. Continue?")){this.dispatchEvent(new Event("error")),this.emitClose(1e3);return}localStorage.disclaimer_accepted=1}this.inner.eaglerIn.write(t).catch(()=>{})}close(){if(!(this.readyState==WebSocket.CLOSING||this.readyState==WebSocket.CLOSED)){this.readyState=WebSocket.CLOSING;try{this.inner.close()}catch{}this.emitClose(1e3)}}},Ee=class extends le{constructor(e){super(),this.url=e,setTimeout(()=>{this.readyState=WebSocket.OPEN,this.dispatchEvent(new Event("open"))})}send(e){if(typeof e=="string"&&e.toLowerCase()==="accept: motd"){let t=localStorage.wispcraft_accounts?JSON.parse(localStorage.wispcraft_accounts).length:0;this.emitMessage(JSON.stringify({name:"Settings",brand:"mercuryworkshop",vers:"wispcraft/"+L,cracked:!0,time:Date.now(),uuid:"00000000-0000-0000-0000-000000000000",type:"motd",data:{cache:!1,icon:!0,online:t,max:0,motd:["Sign in with Microsoft","Configure Proxy URL"],players:[`Version: ${L}`,`Build: ${Ue}`]}})),fetch(rt).then(n=>n.blob()).then(n=>createImageBitmap(n)).then(n=>{let o=new OffscreenCanvas(n.width,n.height),s=o.getContext("2d");s.drawImage(n,0,0);let a=s.getImageData(0,0,o.width,o.height).data;this.emitMessage(new Uint8Array(a))}).catch(()=>{})}else this.readyState===WebSocket.OPEN&&(this.readyState=WebSocket.CLOSING,D(),this.emitMessage(Wt("Opened the Wispcraft settings.")),setTimeout(()=>this.emitClose(1e3),50))}close(){this.emitClose(1e3)}},Ae=WebSocket;function nt(){return new Proxy(Ae,{construct(r,e,t){let[n,o]=e;if(typeof n=="string"&&n!==I&&!window.__wispcraftOff){let s=null;try{s=new URL(n)}catch{}let a=s&&s.port==""&&s.pathname.startsWith("//");if(a&&s.hostname=="java"){let d=new Te(n);return d.start(),d}else if(a&&s.hostname=="settings")return new Ee(n)}return o===void 0?new Ae(n):new Ae(n,o)}})}var I=window.anura&&window.anura.wsproxyURL||new URL(window.location.href).searchParams.get("wisp")||localStorage.wispcraft_wispurl||$,w={user:null,yggToken:"",msToken:""};function J(r){let e=new URL(r);e.pathname.endsWith("/")||(e.pathname+="/"),I=e.href}try{J(I)}catch(r){console.error(r)}function ae(){let r=localStorage.wispcraft_accounts;if(r)return JSON.parse(r)}function ce(){let r=localStorage.wispcraft_last_used_account,e=ae();if(r&&e)return e.find(t=>t.username===r)}if(localStorage.wispcraft_accounts){let r=ce();r&&(async()=>{try{w.msToken=r.ms,w.yggToken=r.token,w.user=await W(w.yggToken)}catch{w.yggToken=await M(w.msToken),w.user=await W(w.yggToken)}})()}var Dt=D,Ot=Q,Mt=fetch;window.fetch=async function(r,e){try{return await Mt(r,e)}catch(t){let n=typeof r=="string"?r:r instanceof URL?r.href:r.url;if(!/^https?:/i.test(n))throw t;return await A(n,e)}};window.WebSocket=nt();window.__wispcraft={showSettings:()=>D(),version:L,account:()=>w.user&&w.user.name,wispUrl:()=>I};window.anura&&(document.addEventListener("click",function(){setTimeout(function(){window.frameElement?.focus(),window.focus()},5)}),window.frameElement?.focus());return lt(qt);})();
