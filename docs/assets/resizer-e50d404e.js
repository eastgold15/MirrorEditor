import { c as a, a as c, h as l, u as n, o } from "./index-5fe9b34d.js";
import { _ as r } from "./index-337f738f.js";

const i = {
		__name: "resizer",
		props: {
			split: {
				type: String,
				validator: (e) => ["vertical", "horizontal"].includes(e),
				required: !0,
			},
			className: { type: String, default: "" },
		},
		setup(e) {
			const s = e,
				t = a(() => ["splitter-pane-resizer", s.split, s.className].join(" "));
			return (p, _) => (o(), c("div", { class: l(n(t)) }, null, 2));
		},
	},
	m = r(i, [["__scopeId", "data-v-00ee74f6"]]);
export { m as default };
