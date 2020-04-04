import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface MultipleChoice {
    options: { 
        guid: string; 
        text: string; 
        color: string; 
        x?: number; 
        y?: number; 
        partX1?: number;
        partY1?: number;
        partX2?: number;
        partY2?: number;
        offsetX?: number;
        offsetY?: number;
    }[];
    playerGuid: string;
}

export interface Button {
    text: string;
    waitForClick: boolean;
}

export interface EffectIndicator {
    icon?: IconDefinition;
    text?: string;
    visible: boolean;
    playerPositionDegrees?: number;
    color?: string;
    multipleChoice?: MultipleChoice;
    button?: Button;
}