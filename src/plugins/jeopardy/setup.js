import React from "react";

import { registerPlugin } from "ractf";


import Section from "./components/Section";
import Challenge from "./components/Challenge";


const makeChallenges = (challenges) => {
    let sections = [];

    challenges.cats.forEach((cat, n) => {
        let catChals = [];
        cat.chal.forEach((chal, n) => {
            catChals.push(
                <Challenge key={n} name={chal.name} done={chal.done} points={chal.points} />
            );
        });
        sections.push(
            <Section key={n} title={cat.name}>
                {catChals}
            </Section>
        );
    });

    return sections;
}


export default () => {
    registerPlugin("categoryType", 1, {generator: makeChallenges});
}