import FormField from "components/forms/FormField";

const AV_OPTIONS = [
    { value: "N", label: "Network (AV:N)" },
    { value: "A", label: "Adjacent Network (AV:A)" },
    { value: "L", label: "Local (AV:L)" },
    { value: "P", label: "Physical (AV:P)" },
];

const AC_OPTIONS = [
    { value: "L", label: "Low (AC:L)" },
    { value: "H", label: "High (AC:H)" },
];

const AT_OPTIONS = [
    { value: "N", label: "None (AT:N)" },
    { value: "P", label: "Present (AT:P)" },
];

const PR_OPTIONS = [
    { value: "N", label: "None (PR:N)" },
    { value: "L", label: "Low (PR:L)" },
    { value: "H", label: "High (PR:H)" },
];

const UI_OPTIONS = [
    { value: "N", label: "None (UI:N)" },
    { value: "P", label: "Passive (UI:P)" },
    { value: "A", label: "Active (UI:A)" },
];

const CIA_OPTIONS = [
    { value: "H", label: "High (C/I/A:H)" },
    { value: "L", label: "Low (C/I/A:L)" },
    { value: "N", label: "None (C/I/A:N)" },
];

const calculateCvss4Score = (av, ac, at, pr, ui, vc, vi, va, sc, si, sa) => {
    // Exploitability factors
    const av_val = { N: 1.0, A: 0.8, L: 0.5, P: 0.2 }[av];
    const ac_val = { L: 1.0, H: 0.7 }[ac];
    const at_val = { N: 1.0, P: 0.7 }[at];
    const pr_val = { N: 1.0, L: 0.7, H: 0.4 }[pr];
    const ui_val = { N: 1.0, P: 0.8, A: 0.6 }[ui];

    // Impact factors
    const getImpactFactor = (val) => {
        if (val === "H") return 1.0;
        if (val === "L") return 0.5;
        return 0.0;
    };

    const vuln_sys_impact = (getImpactFactor(vc) + getImpactFactor(vi) + getImpactFactor(va)) / 3.0;
    const sub_sys_impact = (getImpactFactor(sc) + getImpactFactor(si) + getImpactFactor(sa)) / 3.0;

    const total_impact = vuln_sys_impact * 0.85 + sub_sys_impact * 0.15;
    const exploitability = av_val * ac_val * at_val * pr_val * ui_val;

    if (total_impact === 0) return 0.0;

    const score = (total_impact * 8.5 + exploitability * 1.5);
    return parseFloat(Math.min(score, 10).toFixed(1));
};

const parseCvss4Vector = (vector) => {
    const defaultVals = { av: "N", ac: "L", at: "N", pr: "N", ui: "N", vc: "H", vi: "H", va: "H", sc: "N", si: "N", sa: "N" };
    if (!vector) return defaultVals;
    const parts = vector.split("/");
    const vals = { ...defaultVals };
    parts.forEach(part => {
        const [key, value] = part.split(":");
        if (key && value) {
            const lowKey = key.toLowerCase();
            if (lowKey in vals) {
                vals[lowKey] = value;
            }
        }
    });
    return vals;
};

const CvssCalculator = ({ finding, findingSetter: setFinding }: any) => {
    const vector = finding.cvssVector || "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N";
    // The vector is the single source of truth: each metric is read from it, and changes write back to it.
    const { av, ac, at, pr, ui, vc, vi, va, sc, si, sa } = parseCvss4Vector(vector);

    const updateCvss = (newAv, newAc, newAt, newPr, newUi, newVc, newVi, newVa, newSc, newSi, newSa) => {
        const score = calculateCvss4Score(newAv, newAc, newAt, newPr, newUi, newVc, newVi, newVa, newSc, newSi, newSa);
        const newVector = `CVSS:4.0/AV:${newAv}/AC:${newAc}/AT:${newAt}/PR:${newPr}/UI:${newUi}/VC:${newVc}/VI:${newVi}/VA:${newVa}/SC:${newSc}/SI:${newSi}/SA:${newSa}`;
        setFinding({
            ...finding,
            cvssScore: score,
            cvssVector: newVector,
        });
    };

    return (
        <div style={{ padding: "10px 0" }}>
            <h5 className="title is-6 mb-3">CVSS v4.0 Metric Selector</h5>
            <FormField
                htmlFor="cvss4-av"
                label="Attack Vector (AV)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-av" value={av}onChange={val => { updateCvss(val.target.value, ac, at, pr, ui, vc, vi, va, sc, si, sa); }}>
                            {AV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-ac"
                label="Attack Complexity (AC)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-ac" value={ac}onChange={val => { updateCvss(av, val.target.value, at, pr, ui, vc, vi, va, sc, si, sa); }}>
                            {AC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-at"
                label="Attack Requirements (AT)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-at" value={at}onChange={val => { updateCvss(av, ac, val.target.value, pr, ui, vc, vi, va, sc, si, sa); }}>
                            {AT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-pr"
                label="Privileges Required (PR)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-pr" value={pr}onChange={val => { updateCvss(av, ac, at, val.target.value, ui, vc, vi, va, sc, si, sa); }}>
                            {PR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-ui"
                label="User Interaction (UI)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-ui" value={ui}onChange={val => { updateCvss(av, ac, at, pr, val.target.value, vc, vi, va, sc, si, sa); }}>
                            {UI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <hr style={{ margin: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
            <h6 className="title is-6 mb-2">Vulnerable System Impact</h6>
            <FormField
                htmlFor="cvss4-vc"
                label="Confidentiality (VC)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-vc" value={vc}onChange={val => { updateCvss(av, ac, at, pr, ui, val.target.value, vi, va, sc, si, sa); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-vi"
                label="Integrity (VI)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-vi" value={vi}onChange={val => { updateCvss(av, ac, at, pr, ui, vc, val.target.value, va, sc, si, sa); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-va"
                label="Availability (VA)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-va" value={va}onChange={val => { updateCvss(av, ac, at, pr, ui, vc, vi, val.target.value, sc, si, sa); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <hr style={{ margin: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
            <h6 className="title is-6 mb-2">Subsequent System Impact</h6>
            <FormField
                htmlFor="cvss4-sc"
                label="Confidentiality (SC)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-sc" value={sc}onChange={val => { updateCvss(av, ac, at, pr, ui, vc, vi, va, val.target.value, si, sa); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-si"
                label="Integrity (SI)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-si" value={si}onChange={val => { updateCvss(av, ac, at, pr, ui, vc, vi, va, sc, val.target.value, sa); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
            <FormField
                htmlFor="cvss4-sa"
                label="Availability (SA)"
                control={
                    <div className="select is-fullwidth">
                        <select id="cvss4-sa" value={sa}onChange={val => { updateCvss(av, ac, at, pr, ui, vc, vi, va, sc, si, val.target.value); }}>
                            {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                }
            />
        </div>
    );
};

export default CvssCalculator;
