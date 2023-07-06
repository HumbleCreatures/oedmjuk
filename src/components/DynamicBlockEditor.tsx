import dynamic from "next/dynamic";

export const DynamicBlockEditor = dynamic(() => import("./BlockEditor"), {
    ssr: false,
})

