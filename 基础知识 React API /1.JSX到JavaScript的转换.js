
 /*
  * 组件第一个字母要大写，否则会被babel转义成字符串 React.createElement('comp', {
    id: "box1"
  }, "df", React.createElement("span", null));
  */
<Comp id='box1'>
	df<span></span>
</Comp>


function comp(){
	return <h1>学习react</h1>
}


/*会直接转变成*/


React.createElement(Comp, {
    id: "box1"
  }, "df", React.createElement("span", null));
  
  function comp() {
    return React.createElement("h1", null, "\u5B66\u4E60react");
  }


 


