declare namespace NodeJS {
    declare interface Require {
        context: (s: string, bool: boolean, string) => void;
    }
}


declare const MODE: 'DEV' | 'PROD';