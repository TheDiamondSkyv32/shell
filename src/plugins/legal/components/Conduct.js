import React from "react";
import { Page } from "ractf";
import Wrap from "./Wrap";

export default () => <Page>
    <Wrap>
        <h1>Code of Conduct</h1>
        <i>The following rules should be followed at ALL TIMES when you are participating in the CTF. By using this site you adhere to these terms unconditionally, violation of these terms may result in your access being revoked and/or your account terminated. Really Awesome CTF reserves the right to terminate accounts or revoke any access rights at the admins discretion, without any warning or prior notice.</i>

        <ul>
            <li>Attacking anything other than the provided targets is out of scope. We are monitoring this CTF closely and will revoke access of anyone appearing to be attempting to attack the scoreboard, other participants, or the infrastructure beyond the provided targets.</li>
            <li>Purposeful attempts to disrupt the CTF, hack unintended systems, or hack other participants will result in immediate termination of your Really Awesome CTF account, including potentially being reported to law enforcement.</li>
            <li>The challenge briefings will provide you with the endpoints you are permitted to target. To complete the challenge you will not need to target anything outside the provided endpoint. Do not attempt to hack anything other than the provided, specified targets.</li>
            <li>If you are not sure if something you want to try is within scope, <b>*ASK first*</b> by DMing a Team Member on discord.</li>
            <li>If you suspect something is broken or find a bug you want to report, please DM a Team Member on Discord.</li>
        </ul>
    </Wrap>
</Page>