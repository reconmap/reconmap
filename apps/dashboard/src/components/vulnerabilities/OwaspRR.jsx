import NativeInput from "components/form/NativeInput";
import { useState } from "react";
import Select from "react-select";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts";

const OwaspRR = ({ vulnerability, vulnerabilitySetter: setVulnerability }) => {
    const [isValidOwaspVector, setIsValidOwaspVector] = useState(true);
    const [skillLevelValue, setSkillLevelValue] = useState(null);
    const [motiveValue, setMotiveValue] = useState(null);
    const [opportunityValue, setOpportunityValue] = useState(null);
    const [sizeValue, setSizeValue] = useState(null);
    const [lossOfConfidentialityValue, setLossOfConfidentialityValue] = useState(null);
    const [lossOfIntegrityValue, setLossOfIntegrityValue] = useState(null);
    const [lossOfAvailabilityValue, setLossOfAvailabilityValue] = useState(null);
    const [lossOfAccountabilityValue, setLossOfAccountabilityValue] = useState(null);
    const [easeOfDiscoveryValue, setEaseOfDiscoveryValue] = useState(null);
    const [easeOfExploitValue, setEaseOfExploitValue] = useState(null);
    const [awarenessValue, setAwarenessValue] = useState(null);
    const [intrusionDetectionValue, setIntrusionDetectionValue] = useState(null);
    const [financialDamageValue, setFinancialDamageValue] = useState(null);
    const [reputationDamageValue, setReputationDamageValue] = useState(null);
    const [nonComplianceValue, setNonComplianceValue] = useState(null);
    const [privacyViolationValue, setPrivacyViolationValue] = useState(null);
    let owaspRRChartData = [
        { subject: "Skills required", value: 1, id: "SL" },
        { subject: "Motive", value: 1, id: "M" },
        { subject: "Opportunity", value: 0, id: "O" },
        { subject: "Population size", value: 2, id: "S" },
        { subject: "Ease of discovery", value: 1, id: "ED" },
        { subject: "Ease of exploit", value: 1, id: "EE" },
        { subject: "Awareness", value: 1, id: "A" },
        { subject: "Intrusion detection", value: 1, id: "ID" },
        { subject: "Loss of confidentiality", value: 2, id: "LC" },
        { subject: "Loss of integrity", value: 1, id: "LI" },
        { subject: "Loss of availability", value: 1, id: "LAV" },
        { subject: "Loss of accountability", value: 1, id: "LAC" },
        { subject: "Financial damage", value: 1, id: "FD" },
        { subject: "Reputation damage", value: 1, id: "RD" },
        { subject: "Non-compliance", value: 2, id: "NC" },
        { subject: "Privacy violation", value: 3, id: "PV" },
    ];
    const [chartData, setChartData] = useState(owaspRRChartData);

    const onVectorChange = (ev) => {
        const target = ev.target;
        const name = target.name;
        let value = target.value;
        if (validateVector(value)) {
            let scores = computeOwaspScores(value);
            setVulnerability({
                ...vulnerability,
                owasp_impact: scores[0],
                owasp_likehood: scores[1],
                owasp_overall: scores[2],
                [name]: value,
            });
        } else {
            setVulnerability({ ...vulnerability, [name]: value });
        }
    };

    const validateVector = (vector) => {
        const vectorRegex = new RegExp(
            /^\(SL:[1,3,5,6,9]\/M:[1,4,9]\/O:[0,4,7,9]\/S:[2,4,5,6,9]\/ED:[1,3,7,9]\/EE:[1,3,5,9]\/A:[1,4,6,9]\/ID:[1,3,8,9]\/LC:[2,6,7,9]\/LI:[1,3,5,7,9]\/LAV:[1,5,7,9]\/LAC:[1,7,9]\/FD:[1,3,7,9]\/RD:[1,4,5,9]\/NC:[2,5,7]\/PV:[3,5,7,9]\)$/,
        );
        const isValid = vectorRegex.test(vector);
        setIsValidOwaspVector(isValid);
        return isValid;
    };

    const parseVector = (vector) => {
        return vector
            .slice(1, -1)
            .split(/\//)
            .map((s) => s.split(":"));
    };

    const computeLikehood = (fields) => {
        let sum = 0;
        fields.map(([key, value]) => {
            if (
                key === "SL" ||
                key === "M" ||
                key === "O" ||
                key === "S" ||
                key === "ED" ||
                key === "EE" ||
                key === "A" ||
                key === "ID"
            ) {
                sum += parseInt(value);
            }
            return sum;
        });
        return sum / 8;
    };

    const computeImpact = (fields) => {
        let sum = 0;
        fields.map(([key, value]) => {
            if (
                key === "LC" ||
                key === "LI" ||
                key === "LAV" ||
                key === "LAC" ||
                key === "FD" ||
                key === "RD" ||
                key === "NC" ||
                key === "PV"
            ) {
                sum += parseInt(value);
            }
            return sum;
        });
        return sum / 8;
    };

    const computeOverall = (impact, likehood) => {
        if (impact < 3 && likehood < 3) {
            return "note";
        } else if ((impact < 3 && likehood < 6) || (impact < 6 && likehood < 3)) {
            return "low";
        } else if (impact < 3 || likehood < 3 || (impact < 6 && likehood < 6)) {
            return "medium";
        } else if (impact < 6 || likehood < 6) {
            return "high";
        } else {
            return "critical";
        }
    };

    const computeValues = (fields) => {
        const likehood = computeLikehood(fields);
        const impact = computeImpact(fields);
        const overall = computeOverall(impact, likehood);
        return [impact, likehood, overall];
    };

    const computeOwaspScores = (vector) => {
        let fields = parseVector(vector);
        return computeValues(fields);
    };

    const risk_colors = {
        note: { label: "Note", color: "var(--blue)" },
        low: { label: "Low", color: "var(--green)" },
        medium: { label: "Medium", color: "#FF8C00" },
        high: { label: "High", color: "var(--red)" },
        critical: { label: "Critical", color: "var(--purple)" },
    };

    const OwaspChart = () => (
        <RadarChart outerRadius={180} width={900} height={550} data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            <Radar
                name="OWASP Risk Rating"
                dataKey="value"
                stroke={risk_colors[vulnerability.owasp_overall || "note"].color}
                fill={risk_colors[vulnerability.owasp_overall || "note"].color}
                fillOpacity={0.7}
            />
        </RadarChart>
    );

    const skillLevelOptions = [
        { value: 1, label: "1 - No technical skills" },
        { value: 3, label: "3 - Some technical skills" },
        { value: 5, label: "5 - Advanced computer user" },
        { value: 6, label: "6 - Network and programming skills" },
        { value: 9, label: "9 - Security penetration skills" },
    ];

    const motiveOptions = [
        { value: 1, label: "1 - Low or no reward" },
        { value: 4, label: "4 - Possible reward" },
        { value: 9, label: "9 - High reward" },
    ];

    const opportunityOptions = [
        { value: 0, label: "0 - Full access or expensive resources required " },
        { value: 4, label: "4 - Special access or resources required" },
        { value: 7, label: "7 - Some access or resources required" },
        { value: 9, label: "9 - No access or resources required" },
    ];

    const sizeOptions = [
        { value: 2, label: "2 - Developers, System administrators" },
        { value: 4, label: "4 - Intranet users" },
        { value: 5, label: "5 - Partners" },
        { value: 6, label: "6 - Authenticated users" },
        { value: 9, label: "9 - Anonymous Internet users" },
    ];

    const getValue = (fields, name, updateName, newValue) => {
        if (updateName === name) {
            return newValue;
        }
        let temp = 0;
        fields.map(([key, value]) => {
            if (key === name) {
                temp = value;
            }
            return temp;
        });

        return temp;
    };

    const produceVector = (fields, name, newValue) => {
        return (
            "(SL:" +
            getValue(fields, "SL", name, newValue) +
            "/" +
            "M:" +
            getValue(fields, "M", name, newValue) +
            "/" +
            "O:" +
            getValue(fields, "O", name, newValue) +
            "/" +
            "S:" +
            getValue(fields, "S", name, newValue) +
            "/" +
            "ED:" +
            getValue(fields, "ED", name, newValue) +
            "/" +
            "EE:" +
            getValue(fields, "EE", name, newValue) +
            "/" +
            "A:" +
            getValue(fields, "A", name, newValue) +
            "/" +
            "ID:" +
            getValue(fields, "ID", name, newValue) +
            "/" +
            "LC:" +
            getValue(fields, "LC", name, newValue) +
            "/" +
            "LI:" +
            getValue(fields, "LI", name, newValue) +
            "/" +
            "LAV:" +
            getValue(fields, "LAV", name, newValue) +
            "/" +
            "LAC:" +
            getValue(fields, "LAC", name, newValue) +
            "/" +
            "FD:" +
            getValue(fields, "FD", name, newValue) +
            "/" +
            "RD:" +
            getValue(fields, "RD", name, newValue) +
            "/" +
            "NC:" +
            getValue(fields, "NC", name, newValue) +
            "/" +
            "PV:" +
            getValue(fields, "PV", name, newValue) +
            ")"
        );
    };

    const updateSelectedValue = (event, id) => {
        switch (id) {
            case "SL":
                setSkillLevelValue(event);
                break;
            case "M":
                setMotiveValue(event);
                break;
            case "O":
                setOpportunityValue(event);
                break;
            case "S":
                setSizeValue(event);
                break;
            case "ED":
                setEaseOfDiscoveryValue(event);
                break;
            case "EE":
                setEaseOfExploitValue(event);
                break;
            case "A":
                setAwarenessValue(event);
                break;
            case "ID":
                setIntrusionDetectionValue(event);
                break;
            case "LC":
                setLossOfConfidentialityValue(event);
                break;
            case "LI":
                setLossOfIntegrityValue(event);
                break;
            case "LAV":
                setLossOfAvailabilityValue(event);
                break;
            case "LAC":
                setLossOfAccountabilityValue(event);
                break;
            case "FD":
                setFinancialDamageValue(event);
                break;
            case "RD":
                setReputationDamageValue(event);
                break;
            case "NC":
                setNonComplianceValue(event);
                break;
            case "PV":
                setPrivacyViolationValue(event);
                break;
            default:
                console.warn("invalid id: ", id);
        }
    };

    const updateChart = (id, value) => {
        chartData.forEach((element) => {
            if (element.id === id) {
                element.value = value;
            }
        });
        setChartData(chartData);
    };

    const updateValues = (event, id) => {
        let vector = vulnerability.owasp_vector;
        if (!vector) {
            vector = "(SL:1/M:1/O:0/S:2/ED:1/EE:1/A:1/ID:1/LC:2/LI:1/LAV:1/LAC:1/FD:1/RD:1/NC:2/PV:3)";
        }
        let fields = parseVector(vector);
        vector = produceVector(fields, id, event.value);
        let scores = computeOwaspScores(vector);
        setVulnerability({
            ...vulnerability,
            owasp_impact: scores[0],
            owasp_likehood: scores[1],
            owasp_overall: scores[2],
            owasp_vector: vector,
        });
        updateSelectedValue(event, id);
        updateChart(id, event.value);
    };

    const getCurrentValue = (options, name) => {
        const vector = vulnerability.owasp_vector;
        if (!vector) {
            return options[0];
        }
        const fields = parseVector(vector);
        const value = getValue(fields, name, "", 0);
        updateChart(name, value);
        let found = null;
        options.forEach((element) => {
            if (element.value === parseInt(value)) {
                found = element;
            }
        });
        // if nothing found, fallback to default
        if (!found) {
            found = options[0];
        }
        return found;
    };

    const ThreatAgentFactors = () => (
        <div>
            <h6>Threat agent factors</h6>
            <label>
                Skill level
                <Select
                    options={skillLevelOptions}
                    onChange={(e) => updateValues(e, "SL")}
                    value={skillLevelValue || getCurrentValue(skillLevelOptions, "SL")}
                />
            </label>
            <label>
                Motive
                <Select
                    options={motiveOptions}
                    onChange={(e) => updateValues(e, "M")}
                    value={motiveValue || getCurrentValue(motiveOptions, "M")}
                />
            </label>
            <label>
                Opportunity
                <Select
                    options={opportunityOptions}
                    onChange={(e) => updateValues(e, "O")}
                    value={opportunityValue || getCurrentValue(opportunityOptions, "O")}
                />
            </label>
            <label>
                {" "}
                Size
                <Select
                    options={sizeOptions}
                    onChange={(e) => updateValues(e, "S")}
                    value={sizeValue || getCurrentValue(sizeOptions, "S")}
                />
            </label>
        </div>
    );

    const lossOfConfidentialityOptions = [
        { value: 2, label: "2 - Minimal non-sensitive data disclosed" },
        { value: 6, label: "6 - Minimal critical data disclosed" },
        { value: 6, label: "6 - Extensive non-sensitive data disclosed" },
        { value: 7, label: "7 - Extensive critical data disclosed" },
        { value: 9, label: "9 - All data disclosed" },
    ];

    const lossOfIntegrityOptions = [
        { value: 1, label: "1 - Minimal slightly corrupt data" },
        { value: 3, label: "3 - Minimal seriously corrupt data" },
        { value: 5, label: "5 - Extensive slightly corrupt data" },
        { value: 7, label: "7 - Extensive seriously corrupt data " },
        { value: 9, label: "9 - All data totally corrupt" },
    ];

    const lossOfAvailabilityOptions = [
        { value: 1, label: "1 - Minimal secondary services interrupted" },
        { value: 5, label: "5 - Minimal primary services interrupted" },
        { value: 5, label: "5 - Extensive secondary services interrupted" },
        { value: 7, label: "7 - Extensive primary services interrupted" },
        { value: 9, label: "9 - All services completely lost" },
    ];

    const lossOfAccountabilityOptions = [
        { value: 1, label: "1 - Fully traceable" },
        { value: 7, label: "7 - Possibly traceable" },
        { value: 9, label: "9 - Completely anonymous" },
    ];

    const TechnicalImpactFactors = () => (
        <div>
            <h6>Technical impact factors</h6>
            <label>
                Loss of confidentiality
                <Select
                    options={lossOfConfidentialityOptions}
                    onChange={(e) => updateValues(e, "LC")}
                    value={lossOfConfidentialityValue || getCurrentValue(lossOfConfidentialityOptions, "LC")}
                />
            </label>
            <label>
                Loss of integrity
                <Select
                    options={lossOfIntegrityOptions}
                    onChange={(e) => updateValues(e, "LI")}
                    value={lossOfIntegrityValue || getCurrentValue(lossOfIntegrityOptions, "LI")}
                />
            </label>
            <label>
                Loss of availability
                <Select
                    options={lossOfAvailabilityOptions}
                    onChange={(e) => updateValues(e, "LAV")}
                    value={lossOfAvailabilityValue || getCurrentValue(lossOfAvailabilityOptions, "LAV")}
                />
            </label>
            <label>
                {" "}
                Loss of accountability
                <Select
                    options={lossOfAccountabilityOptions}
                    onChange={(e) => updateValues(e, "LAC")}
                    value={lossOfAccountabilityValue || getCurrentValue(lossOfAccountabilityOptions, "LAC")}
                />
            </label>
        </div>
    );

    const easeOfDiscoveryOptions = [
        { value: 1, label: "1 - Practically impossible " },
        { value: 3, label: "3 - Difficult" },
        { value: 7, label: "7 - Easy" },
        { value: 9, label: "9 - Automated tools available" },
    ];

    const easeOfExploitOptions = [
        { value: 1, label: "1 - Theoretical" },
        { value: 3, label: "3 - Difficult" },
        { value: 5, label: "5 - Easy" },
        { value: 9, label: "9 - Automated tools available" },
    ];

    const awarenessOptions = [
        { value: 1, label: "1 - Unknown" },
        { value: 4, label: "4 - Hidden" },
        { value: 6, label: "6 - Obvious" },
        { value: 9, label: "9 - Public knowledge" },
    ];

    const intrusionDetectionOptions = [
        { value: 1, label: "1 - Active detection in application" },
        { value: 3, label: "3 - Logged and reviewed" },
        { value: 8, label: "8 - Logged without review" },
        { value: 9, label: "9 - Not logged" },
    ];

    const VulnerabilityFactors = () => (
        <div>
            <h6>Vulnerability factors</h6>
            <label>
                Ease of discovery
                <Select
                    options={easeOfDiscoveryOptions}
                    onChange={(e) => updateValues(e, "ED")}
                    value={easeOfDiscoveryValue || getCurrentValue(easeOfDiscoveryOptions, "ED")}
                />
            </label>
            <label>
                Ease of exploit
                <Select
                    options={easeOfExploitOptions}
                    onChange={(e) => updateValues(e, "EE")}
                    value={easeOfExploitValue || getCurrentValue(easeOfExploitOptions, "EE")}
                />
            </label>
            <label>
                Awareness
                <Select
                    options={awarenessOptions}
                    onChange={(e) => updateValues(e, "A")}
                    value={awarenessValue || getCurrentValue(awarenessOptions, "A")}
                />
            </label>
            <label>
                Intrusion detection
                <Select
                    options={intrusionDetectionOptions}
                    onChange={(e) => updateValues(e, "ID")}
                    value={intrusionDetectionValue || getCurrentValue(intrusionDetectionOptions, "ID")}
                />
            </label>
        </div>
    );

    const financialDamageOptions = [
        { value: 1, label: "1 - Less than the cost to fix the vulnerability" },
        { value: 3, label: "3 - Minor effect on annual profit" },
        { value: 7, label: "7 - Significant effect on annual profit" },
        { value: 9, label: "9 - Bankruptcy" },
    ];

    const reputationDamageOptions = [
        { value: 1, label: "1 - Minimal damage" },
        { value: 4, label: "4 - Loss of major accounts" },
        { value: 5, label: "5 - Loss of goodwill" },
        { value: 9, label: "9 - Brand damage" },
    ];

    const nonComplianceOptions = [
        { value: 2, label: "2 - Minor violation" },
        { value: 5, label: "5 - Clear violation" },
        { value: 7, label: "7 - High profile violation" },
    ];

    const privacyViolationOptions = [
        { value: 3, label: "3 - One individual" },
        { value: 5, label: "5 - Hundreds of people" },
        { value: 7, label: "7 - Thousands of people" },
        { value: 9, label: "9 - Millions of people" },
    ];

    const BusinessImpactFactors = () => (
        <div>
            <h6>Business impact factors</h6>
            <label>
                Financial damage
                <Select
                    options={financialDamageOptions}
                    onChange={(e) => updateValues(e, "FD")}
                    value={financialDamageValue || getCurrentValue(financialDamageOptions, "FD")}
                />
            </label>
            <label>
                Reputation damage
                <Select
                    options={reputationDamageOptions}
                    onChange={(e) => updateValues(e, "RD")}
                    value={reputationDamageValue || getCurrentValue(reputationDamageOptions, "RD")}
                />
            </label>
            <label>
                Non-compliance
                <Select
                    options={nonComplianceOptions}
                    onChange={(e) => updateValues(e, "NC")}
                    value={nonComplianceValue || getCurrentValue(nonComplianceOptions, "NC")}
                />
            </label>
            <label>
                Privacy violation
                <Select
                    options={privacyViolationOptions}
                    onChange={(e) => updateValues(e, "PV")}
                    value={privacyViolationValue || getCurrentValue(privacyViolationOptions, "PV")}
                />
            </label>
        </div>
    );

    return (
        <div>
            <label>
                OWASP Risk Rating vector
                <NativeInput
                    type="text"
                    name="owasp_vector"
                    value={vulnerability.owasp_vector || ""}
                    isInvalid={!isValidOwaspVector}
                    onChange={onVectorChange}
                    placeholder="eg: (SL:1/M:1/O:0/S:2/ED:1/EE:1/A:1/ID:1/LC:2/LI:1/LAV:1/LAC:1/FD:1/RD:1/NC:2/PV:3)"
                />
            </label>
            <label>
                OWASP Likehoood score
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="owasp_likehood"
                    value={vulnerability.owasp_likehood || 0.0}
                    disabled
                />
            </label>
            <label>
                OWASP Impact score
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="owasp_impact"
                    value={vulnerability.owasp_impact || 0.0}
                    disabled
                />
            </label>
            <label>
                OWASP Overall score
                <input type="text" name="owasp_overall" value={vulnerability.owasp_overall || "n/a"} disabled />
            </label>
            <OwaspChart />
            <ThreatAgentFactors />
            <VulnerabilityFactors />
            <TechnicalImpactFactors />
            <BusinessImpactFactors />
        </div>
    );
};

export default OwaspRR;
