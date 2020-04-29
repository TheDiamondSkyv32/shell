import React, { useContext } from "react";
import { useTranslation } from 'react-i18next';

import {
    plugins, Form, Input, FlexRow, Checkbox, Button, Select, HR, appContext,
    apiEndpoints, SBTSection, Link, TabbedView, Tab, FlashText
} from "ractf";

import File from "./File";
import Hint from "./Hint";


const MetadataEditor = ({ challenge, category, save }) => {
    let fields = [<HR key={-1} />];
    Object.keys(plugins.challengeMetadata).forEach(key => {
        let i = plugins.challengeMetadata[key];
        let n = 0;
        if (!i.check || i.check(challenge, category)) {
            i.fields.forEach(field => {
                switch (field.type) {
                    case "multiline":
                    case "code":
                    case "text":
                    case "number":
                        fields.push(<label key={key + (n++)} htmlFor={field.name}>{field.label}</label>);
                        let val = challenge.challenge_metadata[field.name];
                        let format = field.type === "number" ? /\d+/ : /.+/;
                        fields.push(
                            <Input val={val !== undefined ? val.toString() : undefined} name={field.name}
                                placeholder={field.label} format={format} key={key + (n++)}
                                rows={field.type === "multiline" || field.type === "code" ? 5 : ""}
                                monospace={field.type === "code"} />
                        );
                        break;
                    case "select":
                        fields.push(<label key={key + (n++)} htmlFor={field.name}>{field.label}</label>);
                        let idx = field.options.map(i => i.key).indexOf(challenge.challenge_metadata[field.name]);
                        fields.push(
                            <Select name={field.name} options={field.options}
                                key={key + (n++)} initial={idx !== -1 ? idx : 0} />
                        );
                        break;
                    case "label":
                        fields.push(<div key={key + (n++)}>{field.label}</div>);
                        break;
                    case "hr":
                        fields.push(<HR key={key + (n++)} />);
                        break;
                    default:
                        fields.push(<div key={key + (n++)}>"Unknown field type: " + field.type</div>);
                        break;
                }
            });
        }
    });
    const saveEdit = (changes) => {
        save({...challenge, challenge_metadata: {
            ...challenge.challenge_metadata,
            ...changes
        }});
    };

    return <div style={{ width: "100%" }}><Form handle={saveEdit}>
        {fields}
        <FlexRow>
            <Button submit>Save Edit</Button>
        </FlexRow>
    </Form></div>;
};

const HintEditor = ({ challenge }) => {
    const endpoints = useContext(apiEndpoints);
    const app = useContext(appContext);

    const addHint = () => {
        app.promptConfirm({ message: "New hint" },
            [{ name: 'name', placeholder: 'Hint name', label: "Name" },
            { name: 'cost', placeholder: 'Hint cost', label: "Cost", format: /\d+/ },
            { name: 'body', placeholder: 'Hint text', label: "Message", rows: 5 }]
        ).then(({ name, cost, body }) => {

            if (!cost.match(/\d+/)) return app.alert("Invalid file size!");

            endpoints.newHint(challenge.id, name, cost, body).then(() =>
                app.alert("New hint added!")
            ).catch(e =>
                app.alert("Error creating new hint:\n" + endpoints.getError(e))
            );
        });
    };

    return <>
        <div className={"challengeLinkGroup"}>
            {!challenge.hints || challenge.hints.length === 0
                ? <FlashText warning>No hints added yet!</FlashText>
                : challenge.hints.map(hint =>
                    <Hint key={hint.id} points={hint.penalty} name={hint.name} id={hint.id} body={hint.text} isEdit />
                )
            }
        </div>

        <FlexRow>
            <Button click={addHint}>Add Hint</Button>
        </FlexRow>
    </>;
};

const FileEditor = ({ challenge }) => {
    const endpoints = useContext(apiEndpoints);
    const app = useContext(appContext);

    const addFile = () => {
        app.promptConfirm({ message: "New file", },
            [{ name: 'name', placeholder: 'File name', label: "Name" },
            { name: 'url', placeholder: 'File URL', label: "URL" },
            { name: 'size', placeholder: 'File size', label: "Size (bytes)", format: /\d+/ }]
        ).then(({ name, url, size }) => {
            if (!size.match(/\d+/)) return app.alert("Invalid file size!");

            endpoints.newFile(challenge.id, name, url, size).then((id) => {
                challenge.files.push(id);
                app.alert("New file added!");
            }).catch(e =>
                app.alert("Error creating new file:\n" + endpoints.getError(e))
            );
        });
    };

    return <>
        <div className={"challengeLinkGroup"}>
            {!challenge.files || challenge.files.length === 0
                ? <FlashText warning>No files added yet!</FlashText>
                : challenge.files.map(file =>
                    file && <File key={file.id} name={file.name} url={file.url} id={file.id} size={file.size} isEdit />
                )
            }
        </div>

        <FlexRow>
            <Button click={addFile}>Add File</Button>
        </FlexRow>
    </>;
};


export default ({ challenge, category, isCreator, saveEdit, removeChallenge }) => {
    const { t } = useTranslation();

    return <SBTSection title={isCreator ? <>New challenge</> : <>Editing: {challenge.name}</>}
        subTitle={<Link className={"backToChals"} to={"..#edit"}>{t("back_to_chal")}</Link>}>
        <br />
        <TabbedView>
            <Tab label={t("editor.challenge")}>
                <Form handle={saveEdit}>
                    <label htmlFor={"name"}>{t("editor.chal_name")}</label>
                    <Input val={challenge.name} name={"name"} placeholder={t("editor.chal_name")} />
                    <label htmlFor={"score"}>{t("editor.chal_points")}</label>
                    <Input val={challenge.score !== undefined ? challenge.score.toString() : undefined} name={"score"}
                        placeholder={t("editor.chal_points")} format={/\d+/} />
                    <label htmlFor={"author"}>{t("editor.chal_author")}</label>
                    <Input val={challenge.author} name={"author"} placeholder={t("editor.chal_author")} />

                    <label htmlFor={"description"}>{t("editor.chal_brief")}</label>
                    <Input rows={5} val={challenge.description} name={"description"}
                        placeholder={t("editor.chal_brief")} />

                    <FlexRow>
                        <Checkbox checked={challenge.hidden} name={"hidden"}>
                            {t("editor.hide_challenge")}
                        </Checkbox>
                        <Checkbox checked={challenge.auto_unlock} name={"autoUnlock"}>
                            {t("editor.auto_unlock")}
                        </Checkbox>
                    </FlexRow>

                    <label htmlFor={"challenge_type"}>{t("editor.chal_type")}</label>
                    <Select options={Object.keys(plugins.challengeType).map(i => ({ key: i, value: i }))}
                        initial={Object.keys(plugins.challengeType).indexOf(challenge.challenge_type)}
                        name={"challenge_type"} />

                    <label htmlFor={"flag_type"}>{t("editor.chal_flag_type")}</label>
                    <Input placeholder={t("editor.chal_flag_type")} name={"flag_type"} monospace
                        val={challenge.flag_type} />
                    <label htmlFor={"flag_metadata"}>{t("editor.chal_flag")}</label>
                    <Input placeholder={t("editor.chal_flag")}
                        name={"flag_metadata"} monospace format={{
                            test: i => { try { JSON.parse(i); return true; } catch (e) { return false; } }
                        }}
                        val={JSON.stringify(challenge.flag_metadata)} />

                    <FlexRow>
                        {!isCreator && <Button click={removeChallenge} warning>{t("editor.remove")}</Button>}
                        <Button submit>{isCreator ? t("editor.create") : t("editor.save")}</Button>
                    </FlexRow>
                </Form>
            </Tab>
            <Tab label={t("editor.files")}>
                {isCreator 
                    ? <FlashText warning bold>Cannot add files to non-existant challenge.</FlashText>
                    : <FileEditor challenge={challenge} />}
            </Tab>
            <Tab label={t("editor.hints")}>
                {isCreator
                    ? <FlashText warning bold>Cannot add hints to non-existant challenge.</FlashText>
                    : <HintEditor challenge={challenge} />}
            </Tab>
            <Tab label={t("editor.metadata")}>
                <MetadataEditor category={category} challenge={challenge} save={saveEdit} />
            </Tab>
        </TabbedView>
    </SBTSection>;
};