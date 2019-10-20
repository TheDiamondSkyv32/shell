import styled, { css } from "styled-components";
import { theme } from "ractf";


export default styled.div`
    font-size: 2em;
    text-align: left;
    cursor: pointer;
    position: relative;
    padding-left: 16px;
    padding-bottom: 8px;
    margin-bottom: 8px;

    &::before {
        content: "";
        display: block;
        width: 0;
        height: 0;
        position: absolute;
        margin-top: -4px;
        left: 0;
        top: 50%;
        border: 5px solid ${theme.fg};
        border-left-color: transparent;
        border-top-color: transparent;
        transform: translate(-50%, -50%) rotate(45deg);
        transition: transform 200ms ease;
    }

    &::after {
        position: absolute;
        content: "";
        display: block;
        top: 100%;
        left: 0;
        width: 0;
        height: 1px;
        background-color: ${theme.bg_l3};
        transition: width 100ms ease;
    }

    ${props => !props.open && css`
        &::after {
            width: 100%;
        }

        &::before {
            transform: translate(-50%, -50%) rotate(-45deg);
        }
    `}
`;