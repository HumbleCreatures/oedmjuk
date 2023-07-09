import dynamic from "next/dynamic";

export const DynamicTemplatedBlockEditor = dynamic(() => import("./TemplatedBlockEditor"), {
    ssr: false,
})

