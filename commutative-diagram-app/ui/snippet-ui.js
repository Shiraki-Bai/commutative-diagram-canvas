/* Starter subset is explicitly labelled; paste the full supplied array to enable more. */
const STARTER_SNIPPETS=String.raw`[
 {trigger:"//",replacement:"\\frac{$0}{$1}",options:"mA"},
 {trigger:"@a",replacement:"\\alpha",options:"mA"},
 {trigger:"@b",replacement:"\\beta",options:"mA"},
 {trigger:"@g",replacement:"\\gamma",options:"mA"},
 {trigger:"@d",replacement:"\\delta",options:"mA"},
 {trigger:"@t",replacement:"\\theta",options:"mA"},
 {trigger:"@l",replacement:"\\lambda",options:"mA"},
 {trigger:"@s",replacement:"\\sigma",options:"mA"},
 {trigger:"@o",replacement:"\\omega",options:"mA"},
 {trigger:"sq",replacement:"\\sqrt{$0}",options:"mA"},
 {trigger:"pw",replacement:"^{\u0024{0:2}}",options:"mA"},
 {trigger:"inv",replacement:"^{-1}",options:"mA"},
 {trigger:"di",replacement:"_{$0}",options:"mA"},
 {trigger:"cc",replacement:"\\mathscr{C}",options:"mA",priority:100},
 {trigger:"RR",replacement:"\\mathbb{R}",options:"mA"},
 {trigger:"Hom",replacement:"\\mathrm{Hom}",options:"mA"},
 {trigger:"End",replacement:"\\mathrm{End}",options:"mA"},
 {trigger:/([A-Za-z])(\d)/,replacement:"[[0]]_[[1]]",options:"rmA"}
]`;
let snippetRules=[];
function loadSnippets(source){const result=SnippetAdapter.parseConfig(source);snippetRules=result.rules;$('snippetReport').textContent='已启用 '+result.rules.length+' / '+result.total+' 条。\n'+(result.warnings.join('\n')||'未发现不兼容条目。')+'\n同优先级按原配置顺序处理；正则自动展开只运行一轮，不递归改写结果。';return result;}
$('snippetConfig').value=STARTER_SNIPPETS;try{$('snippetConfig').value=draftStore.getItem('visual-tikzcd-snippets-v1')||STARTER_SNIPPETS;}catch{}
$('applySnippets').onclick=()=>{try{const result=loadSnippets($('snippetConfig').value);try{draftStore.setItem('visual-tikzcd-snippets-v1',$('snippetConfig').value);}catch{}message('Snippets 已更新：'+result.rules.length+' 条启用，请查看兼容报告。');}catch(error){$('snippetReport').textContent='未应用：'+error.message;message('Snippets 解析失败，现有规则保留。');}};
try{loadSnippets($('snippetConfig').value);}catch{loadSnippets(STARTER_SNIPPETS);}
for(const id of ['nodeName','upper','lower'])SnippetAdapter.attach($(id),()=>snippetRules,()=>true,()=>$('snippetEnabled').checked);
// Full source mode is deliberately not guessed: only plain text-mode snippets
// are allowed there when explicitly enabled. Math scopes need an editor parser.
SnippetAdapter.attach($('output'),()=>snippetRules.filter(rule=>!/[mMn]/.test(rule.options)),()=>false,()=>$('snippetEnabled').checked&&$('sourceSnippets').checked);
