import { useState, useEffect } from "react";

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

const CvssCalculator = ({ vulnerability, vulnerabilitySetter: setVulnerability }) => {
    const vector = vulnerability.cvssVector || "CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N";
    const values = parseCvss4Vector(vector);

    const [av, setAv] = useState(values.av);
    const [ac, setAc] = useState(values.ac);
    const [at, setAt] = useState(values.at);
    const [pr, setPr] = useState(values.pr);
    const [ui, setUi] = useState(values.ui);
    const [vc, setVc] = useState(values.vc);
    const [vi, setVi] = useState(values.vi);
    const [va, setVa] = useState(values.va);
    const [sc, setSc] = useState(values.sc);
    const [si, setSi] = useState(values.si);
    const [sa, setSa] = useState(values.sa);

    useEffect(() => {
        const parsed = parseCvss4Vector(vulnerability.cvssVector);
        setAv(parsed.av);
        setAc(parsed.ac);
        setAt(parsed.at);
        setPr(parsed.pr);
        setUi(parsed.ui);
        setVc(parsed.vc);
        setVi(parsed.vi);
        setVa(parsed.va);
        setSc(parsed.sc);
        setSi(parsed.si);
        setSa(parsed.sa);
    }, [vulnerability.cvssVector]);

    const updateCvss = (newAv, newAc, newAt, newPr, newUi, newVc, newVi, newVa, newSc, newSi, newSa) => {
        const score = calculateCvss4Score(newAv, newAc, newAt, newPr, newUi, newVc, newVi, newVa, newSc, newSi, newSa);
        const newVector = `CVSS:4.0/AV:${newAv}/AC:${newAc}/AT:${newAt}/PR:${newPr}/UI:${newUi}/VC:${newVc}/VI:${newVi}/VA:${newVa}/SC:${newSc}/SI:${newSi}/SA:${newSa}`;
        setVulnerability({
            ...vulnerability,
            cvssScore: score,
            cvssVector: newVector,
        });
    };

    return (
        <div style={{ padding: "10px 0" }}>
            <h5 className="title is-6 mb-3">CVSS v4.0 Metric Selector</h5>
            <div className="field">
                <label className="label">Attack Vector (AV)</label>
                <div className="select is-fullwidth">
                    <select value={av} onChange={val => { setAv(val.target.value); updateCvss(val.target.value, ac, at, pr, ui, vc, vi, va, sc, si, sa); }}>
                        {AV_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Attack Complexity (AC)</label>
                <div className="select is-fullwidth">
                    <select value={ac} onChange={val => { setAc(val.target.value); updateCvss(av, val.target.value, at, pr, ui, vc, vi, va, sc, si, sa); }}>
                        {AC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Attack Requirements (AT)</label>
                <div className="select is-fullwidth">
                    <select value={at} onChange={val => { setAt(val.target.value); updateCvss(av, ac, val.target.value, pr, ui, vc, vi, va, sc, si, sa); }}>
                        {AT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Privileges Required (PR)</label>
                <div className="select is-fullwidth">
                    <select value={pr} onChange={val => { setPr(val.target.value); updateCvss(av, ac, at, val.target.value, ui, vc, vi, va, sc, si, sa); }}>
                        {PR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">User Interaction (UI)</label>
                <div className="select is-fullwidth">
                    <select value={ui} onChange={val => { setUi(val.target.value); updateCvss(av, ac, at, pr, val.target.value, vc, vi, va, sc, si, sa); }}>
                        {UI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <hr style={{ margin: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
            <h6 className="title is-6 mb-2">Vulnerable System Impact</h6>
            <div className="field">
                <label className="label">Confidentiality (VC)</label>
                <div className="select is-fullwidth">
                    <select value={vc} onChange={val => { setVc(val.target.value); updateCvss(av, ac, at, pr, ui, val.target.value, vi, va, sc, si, sa); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Integrity (VI)</label>
                <div className="select is-fullwidth">
                    <select value={vi} onChange={val => { setVi(val.target.value); updateCvss(av, ac, at, pr, ui, vc, val.target.value, va, sc, si, sa); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Availability (VA)</label>
                <div className="select is-fullwidth">
                    <select value={va} onChange={val => { setVa(val.target.value); updateCvss(av, ac, at, pr, ui, vc, vi, val.target.value, sc, si, sa); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <hr style={{ margin: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }} />
            <h6 className="title is-6 mb-2">Subsequent System Impact</h6>
            <div className="field">
                <label className="label">Confidentiality (SC)</label>
                <div className="select is-fullwidth">
                    <select value={sc} onChange={val => { setSc(val.target.value); updateCvss(av, ac, at, pr, ui, vc, vi, va, val.target.value, si, sa); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Integrity (SI)</label>
                <div className="select is-fullwidth">
                    <select value={si} onChange={val => { setSi(val.target.value); updateCvss(av, ac, at, pr, ui, vc, vi, va, sc, val.target.value, sa); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
            <div className="field">
                <label className="label">Availability (SA)</label>
                <div className="select is-fullwidth">
                    <select value={sa} onChange={val => { setSa(val.target.value); updateCvss(av, ac, at, pr, ui, vc, vi, va, sc, si, val.target.value); }}>
                        {CIA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CvssCalculator;
