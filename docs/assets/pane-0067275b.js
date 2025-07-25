import {
	h as _,
	o as c,
	u as i,
	f as l,
	c as n,
	a as p,
	r,
} from "./index-5fe9b34d.js";
import { _ as o } from "./index-337f738f.js";

const d = {
		__name: "pane",
		props: {
			className: { type: String },
			split: {
				type: String,
				validator: (e) => ["vertical", "horizontal"].indexOf(e) >= 0,
			},
		},
		setup(e) {
			const s = e,
				a = n(() => [s.split, s.className].join(" "));
			return (
				r(20),
				(t, u) => (
					c(),
					p(
						"div",
						{ class: _(i(a)) },
						[l(t.$slots, "default", {}, void 0, !0)],
						2,
					)
				)
			);
		},
	},
	v = o(d, [["__scopeId", "data-v-a6b69b54"]]);
export { v as default };
