import React, { useContext, useState, useEffect } from "react";
import useReactRouter from "../../useReactRouter";
import DatePicker from "react-datepicker";

import { FaFolder, FaFolderOpen, FaRegFolder, FaPencilAlt, FaReceipt } from "react-icons/fa";

import {
    Page, Form, Input, Button, Radio, Spinner, SBTSection, Section, apiContext,
    apiEndpoints, appContext, useApi, ENDPOINTS, useFullyPaginated
} from "ractf";

import "react-datepicker/dist/react-datepicker.css";
import "./AdminPage.scss";


const AdminCard = ({ children, extra, name }) => {
    const [open, setOpen] = useState(false);

    const toggle = e => {
        if (extra)
            setOpen(!open);
        e.preventDefault();
        e.stopPropagation();
    };

    return <div className={"absCard"}>
        {name && <div className={"abscName" + (extra ? " abscn" : "")} onClick={toggle}>{name}</div>}
        {extra ? <div className={"abscVml"} onClick={toggle}>
            {open ? "VIEW LESS" : "VIEW MORE"}
        </div> : null}
        {children && <div className={"abscBody"}>
            {children}
        </div>}
        {open && <div className={"abscExtra"}>
            {extra}
        </div>}
    </div>;
};


const AdminCardSection = ({ children, name }) => {
    return <div className={"absfg"}>
        <div>{name}</div>
        {children}
    </div>;
};


const TreeWrap = ({ children }) => {
    return <div className={"adminTree"}>
        <ul>{children}</ul>
    </div>;
};


const AdminTree = ({ name, children }) => {
    const [open, setOpen] = useState(false);

    return <li>
        <i />
        <span className={"parent"} onClick={() => setOpen(!open)}>
            <i className={"treeItem"}>{
                children.length === 0 ? <FaRegFolder /> : open ? <FaFolderOpen /> : <FaFolder />
            }</i>
            {name}
        </span>
        {children && open && <ul>{children}</ul>}
    </li>;
};


const AdminTreeValue = ({ name, value, setValue }) => {
    const app = useContext(appContext);
    const openEdit = () => {
        app.promptConfirm(
            { message: name, small: true },
            [{ name: "val", val: JSON.stringify(value) }]
        ).then(({ val }) => {
            try {
                val = JSON.parse(val);
            } catch (e) {
                return app.alert("Failed to parse value");
            }
            if ((typeof val) !== (typeof value))
                return app.alert("Cannot change data type");
            if ((typeof setValue) !== "function")
                return app.alert("setValue is not a function");

            setValue(val);
        });
    };

    return <li onClick={setValue && openEdit}>
        <i />
        <span className={"parent"}>
            <i className={"treeItem"}>{setValue ? <FaPencilAlt /> : <FaReceipt />}</i>
            {name}
        </span>
        <span className={"value"}>{
            ((typeof value === "boolean") || (typeof value === "number")) ? value.toString() : value
        }</span>
    </li>;
};


const MemberCard = ({ data }) => {
    const endpoints = useContext(apiEndpoints);
    const app = useContext(appContext);
    const api = useContext(apiContext);
    const [rerender, setRerender] = useState(0);

    const configSet = (key, value) => {
        let initial = data[key];
        data[key] = value;
        setRerender(rerender + 1);
        endpoints.modifyUser(data.id, { [key]: value }).then(() => {
        }).catch(e => {
            data[key] = initial;
            setRerender(rerender + 1);
            app.alert(endpoints.getError(e));
        });
    };
    const set = key => value => configSet(key, value);

    return <AdminTree name={data.username}>
        <AdminTreeValue name={"id"} value={data.id} />
        <AdminTreeValue name={"enabled"} value={data.is_active} setValue={!data.is_staff && set("is_active")} />
        <AdminTreeValue name={"visible"} value={data.is_visible} setValue={set("is_visible")} />
        <AdminTreeValue name={"is_staff"} value={data.is_staff} setValue={data.id !== api.user.id && set("is_staff")} />
        <AdminTreeValue name={"points"} value={data.points} setValue={set("points")} />
        <AdminTree name={"metadata"}>
            <AdminTreeValue name={"email"} value={data.email} setValue={set("email")} />
            <AdminTreeValue name={"email_verified"} value={data.email_verified} setValue={set("email_verified")} />
            <AdminTreeValue name={"bio"} value={data.bio} setValue={set("bio")} />
            <AdminTreeValue name={"discord"} value={data.discord} setValue={set("discord")} />
            <AdminTreeValue name={"discord_id"} value={data.discordid} setValue={set("discordid")} />
            <AdminTreeValue name={"twitter"} value={data.twitter} setValue={set("twitter")} />
            <AdminTreeValue name={"reddit"} value={data.reddit} setValue={set("reddit")} />
        </AdminTree>
        <AdminTree name={"solves"}>
            {data.solves.map(i => <AdminTree name={i.challenge_name}>
                <AdminTreeValue name={"points"} value={i.points} />
                <AdminTreeValue name={"first_blood"} value={i.first_blood} />
                <AdminTreeValue name={"timestamp"} value={i.timestamp} />
            </AdminTree>)}
        </AdminTree>
    </AdminTree>;
};


const TeamCard = ({ data }) => {
    const endpoints = useContext(apiEndpoints);
    const app = useContext(appContext);
    const [rerender, setRerender] = useState(0);

    const configSet = (key, value) => {
        let initial = data[key];
        data[key] = value;
        setRerender(rerender + 1);
        endpoints.modifyTeam(data.id, { [key]: value }).then(() => {
        }).catch(e => {
            data[key] = initial;
            setRerender(rerender + 1);
            app.alert(endpoints.getError(e));
        });
    };
    const set = key => value => configSet(key, value);
    let points = 0;
    data.members.forEach(i => points += i.points);

    return <AdminTree name={data.name}>
        <AdminTreeValue name={"id"} value={data.id} />
        <AdminTreeValue name={"visible"} value={data.is_visible} setValue={set("is_visible")} />
        <AdminTreeValue name={"points"} value={points} />
        <AdminTreeValue name={"owner_id"} value={data.owner} setValue={set("owner")} />
        <AdminTree name={"metadata"}>
            <AdminTreeValue name={"password"} value={data.password} setValue={set("password")} />
            <AdminTreeValue name={"description"} value={data.description} setValue={set("description")} />
        </AdminTree>
        <AdminTree name={"members"}>
            {data.members.map(i => <AdminTree name={i.username}>
                <AdminTreeValue name={"id"} value={i.id} />
                <AdminTreeValue name={"points"} value={i.points} />
            </AdminTree>)}
        </AdminTree>
        <AdminTree name={"solves"}>
            {data.solves.map(i => <AdminTree name={i.challenge_name}>
                <AdminTreeValue name={"solved_by"} value={i.solved_by_name} />
                <AdminTreeValue name={"points"} value={i.points} />
                <AdminTreeValue name={"first_blood"} value={i.first_blood} />
                <AdminTreeValue name={"timestamp"} value={i.timestamp} />
            </AdminTree>)}
        </AdminTree>
    </AdminTree>;
};


const DatePick = ({ initial, configSet, name, configKey }) => {
    const [value, setValue] = useState(initial * 1000);

    const onChange = value => {
        setValue(value);
        configSet(configKey, value.getTime() / 1000);
    };

    return <DatePicker showTimeSelect
        dateFormat="yyyy-MM-dd H:mm"
        autoComplete="off"
        selected={value}
        onChange={onChange}
        style={{ zIndex: 50 }}
        name={name} />;
};


export default () => {
    const endpoints = useContext(apiEndpoints);
    const api = useContext(apiContext);
    const app = useContext(appContext);
    const [adminConfig, setAdminConfig] = useState(null);

    const [allUsersAdmin] = useFullyPaginated(ENDPOINTS.USER);
    const [allTeamsAdmin] = useFullyPaginated(ENDPOINTS.TEAM);
    const [adminConfig_] = useApi(ENDPOINTS.CONFIG);

    const { match } = useReactRouter();
    if (!match) return null;
    const page = match.params.page;

    const configSet = (key, value) => {
        endpoints.setConfigValue(key, value).then(() => {
            if (api.config)
                api.config[key] = value;
            setAdminConfig({ ...adminConfig, key: value });
        }).catch(e => {
            console.error(e);
            app.alert(endpoints.getError(e));
        });
    };

    useEffect(() => {
        if (adminConfig_) {
            let config = {};
            adminConfig_.forEach(({ key, value }) => config[key] = value.value);
            setAdminConfig(config);
        }
    }, [adminConfig_]);

    let content;
    switch (page) {
        case "ctf":
            content = <SBTSection title={"CTF Management"}>
                {adminConfig ? <>
                    <Section title={"Start or Stop"}>
                        <AdminCardSection name={"Start the event before the scheduled start time."}>
                            <Button>Start event</Button>
                        </AdminCardSection>
                        <AdminCardSection name={
                            "End the event before the scheduled end time. This will not disable automatic-start."
                        }>
                            <Button>Stop event</Button>
                        </AdminCardSection>
                    </Section>
                    <Section title={"Automatic Timing"}>
                        <Form>
                            <div className={"absfg"}>
                                <Form>
                                    <label htmlFor={"regStartTime"}>Registration start time</label>
                                    <DatePick initial={adminConfig.register_start_time}
                                        configSet={configSet} name={"regStartTime"}
                                        configKey={"register_start_time"} />
                                </Form>
                            </div>
                            <div className={"absfg"}>
                                <Form>
                                    <label htmlFor={"eventStartTime"}>Event start time</label>
                                    <DatePick initial={adminConfig.start_time}
                                        configSet={configSet} name={"eventStartTime"}
                                        configKey={"start_time"} />
                                </Form>
                            </div>
                            <div className={"absfg"}>
                                <Form>
                                    <label htmlFor={"eventEndTime"}>Event end time</label>
                                    <DatePick initial={adminConfig.end_time}
                                        configSet={configSet} name={"eventEndTime"}
                                        configKey={"end_time"} />
                                </Form>
                            </div>
                        </Form>
                    </Section>
                </> : <Spinner />}
            </SBTSection>;
            break;
        case "config":
            content = <SBTSection title={"Configuration"}>
                {adminConfig ? <>
                    <Section title={"Login"}>
                        <Form>
                            <AdminCardSection name={"Enable or disable site login"}>
                                <Radio onChange={v => configSet("login", v)} value={adminConfig.login}
                                    options={[["Enabled", true], ["Disabled", false]]} />
                            </AdminCardSection>
                        </Form>
                    </Section>
                    <Section title={"Registration"}>
                        <Form>
                            <AdminCardSection name={"Enable or disable site registration"}>
                                <Radio onChange={v => configSet("register", v)} value={adminConfig.register}
                                    options={[["Enabled", true], ["Disabled", false]]} />
                            </AdminCardSection>
                        </Form>
                    </Section>
                    <Section title={"Main Game"}>
                        <Form>
                            <AdminCardSection name={"Scoring"}>
                                <Radio onChange={v => configSet("scoring", v)} value={adminConfig.scoring}
                                    options={[["Enabled", true], ["Disabled", false]]} />
                            </AdminCardSection>
                            <AdminCardSection name={"Flag Submission"}>
                                <Radio onChange={v => configSet("flags", v)} value={adminConfig.flags}
                                    options={[["Enabled", true], ["Disabled", false]]} />
                            </AdminCardSection>
                        </Form>
                    </Section>
                </> : <Spinner />}
            </SBTSection>;
            break;
        case "service":
            content = <SBTSection title={"Service Status"}>
                <Section title={"Code Ingest"}>
                    <div className={"absIndicator unknown"} />
                </Section>
                <Section title={"Mail Daemon"}>
                    <div className={"absIndicator online"} />
                </Section>
                <Section title={"Cespit"}>
                    <div className={"absIndicator offline"} />
                </Section>
                <Section title={"Staging"}>
                    <div className={"absIndicator partial"} />
                </Section>
            </SBTSection>;
            break;
        case "announcements":
            content = <SBTSection title={"Announcements"}>
                <Section title={"Active Announcements"}>
                    <Form>
                        <label>No announcements active</label>
                    </Form>
                </Section>
                <Section title={"Add Announcement"}>
                    <Form>
                        <label htmlFor={"annTitle"}>Title</label>
                        <Input name={"annTitle"} />
                        <label htmlFor={"annBody"}>Announcement text</label>
                        <Input name={"annBody"} rows={4} />
                        <Button>Add</Button>
                    </Form>
                </Section>
            </SBTSection>;
            break;
        case "members":
            content = <SBTSection title={"Members"}>
                {allUsersAdmin ? <>
                    <Section title={"Admins"}>
                        <TreeWrap>
                            {allUsersAdmin.filter(i => i.is_staff).map(i =>
                                <MemberCard key={i.id} data={i} />
                            )}
                        </TreeWrap>
                    </Section>
                    <Section title={"Standard Users"}>
                        <TreeWrap>
                            {allUsersAdmin.filter(i => !i.is_staff).map(i =>
                                <MemberCard key={i.id} data={i} />
                            )}
                        </TreeWrap>
                    </Section>
                </> : <Spinner />}
            </SBTSection>;
            break;
        case "teams":
            content = <SBTSection title={"Teams"}>
                {allTeamsAdmin ? <>
                    <Section title={"All Teams"}>
                        <TreeWrap>
                            {allTeamsAdmin.map(i =>
                                <TeamCard key={i.id} data={i} />
                            )}
                        </TreeWrap>
                    </Section>
                </> : <Spinner />}
            </SBTSection>;
            break;
        default:
            content = <Spinner />;
            break;
    }

    return <Page selfContained>
        {content}
    </Page>;
};
