// Copyright (C) 2020 Really Awesome Technology Ltd
//
// This file is part of RACTF.
//
// RACTF is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// RACTF is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with RACTF.  If not, see <https://www.gnu.org/licenses/>.

import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import QRCode from "qrcode.react";

import {
    Page, Row, Button, Spinner, TextBlock, FormError, H2, Column
} from "@ractf/ui-kit";
import { appContext } from "ractf";
import { add_2fa, verify_2fa, reloadAll } from "@ractf/api";


export default () => {
    const app = useContext(appContext);
    const user = useSelector(state => state.user);
    const [page, setPage] = useState(0);
    const [secret, setSecret] = useState("");
    const [message, setMessage] = useState(null);

    const { t } = useTranslation();

    const startFlow = () => {
        setPage(1);

        add_2fa().then(resp => {
            setSecret(resp.totp_secret);
            setPage(2);
        }).catch(() => {
            setPage(-1);
        });
    };

    const faPrompt = () => {
        app.promptConfirm({ message: t("2fa.required"), small: true },
            [{ name: "pin", placeholder: t("2fa.code_prompt"), format: /^\d{6}$/, limit: 6 }]).then(({ pin }) => {
                if (pin.length !== 6) return faPrompt();

                verify_2fa(pin).then(async resp => {
                    if (resp.valid) {
                        await reloadAll();
                        setPage(3);
                    } else {setMessage(t("2fa.validation_fail"));}
                }).catch(e => {
                    console.error(e);
                    setMessage(t("2fa.validation_fail"));
                });
            }).catch(() => {
                setMessage(t("2fa.unable_to_active"));
            });
    };

    const buildURI = sec => {
        return `otpauth://totp/RACTF:${user.username}?secret=${sec}&issuer=RACTF`;
    };

    const formatSecret = sec => {
        return (
            sec.substring(0, 4) + " " + sec.substring(4, 8) + " " +
            sec.substring(8, 12) + " " + sec.substring(12, 16)
        );
    };

    return <Page title={t("2fa.2fa")} vCentre>
        <Column style={{height: "100%", justifyContent: "center"}}>
            {page === 0 ? <>
                <Row centre>
                    {user.has_2fa ? t("2fa.replace_prompt") : t("2fa.add_prompt")}
                </Row>
                <Row centre>
                    {t("2fa.device_warning")}
                </Row>
                <br />
                <Row centre>
                    <Button to={"/settings"} lesser>{t("2fa.nevermind")}</Button>
                    <Button onClick={startFlow}>{t("2fa.enable_2fa")}</Button>
                </Row>
            </> : page === 1 ? <>
                <Row centre>
                    {t("2fa.enabling")}
                </Row>
                <br />
                <Row centre>
                    <Spinner />
                </Row>
            </> : page === 2 ? <>
                <Row centre>
                    <H2>{t("2fa.finalise")}</H2>
                </Row>
                <Row centre>
                    {t("2fa.please_scan_qr")}
                </Row>
                <Row centre>
                    <QRCode renderAs={"svg"} size={128} fgColor={"#161422"}
                        value={buildURI(secret)} includeMargin />
                </Row>
                <Row centre>
                    {t("2fa.unable_to_qr")}
                </Row>
                <Row centre>
                    <TextBlock>
                        {formatSecret(secret)}
                    </TextBlock>
                </Row>

                {message && <Row><FormError>{message}</FormError></Row>}

                <Row centre>
                    <Button onClick={faPrompt}>{t("2fa.got_it")}</Button>
                </Row>
            </> : page === 3 ? <>
                <Row centre>
                    <H2>{t("2fa.congratulations")}</H2>
                </Row>
                <Row centre>
                    {t("2fa.setup")}
                </Row>
                <br />
                <Row centre>
                    <Button to={"/"}>Yay!</Button>
                </Row>
            </> : <>
                <Row centre>
                    {t("2fa.error")}
                </Row>
                <br />
                <Row centre>
                    <Button to={"/settings"} lesser>{t("2fa.back_to_settings")}</Button>
                    <Button onClick={() => setPage(0)}>{t("2fa.restart")}</Button>
                </Row>
            </>}
        </Column>
    </Page>;
};
