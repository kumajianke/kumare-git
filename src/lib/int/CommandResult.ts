import type { Component } from "svelte";

export interface CommandResult {
    modify: {
        command_history_text?: string[], // 对 command_history_text 的修正
        components ?: {
            show_component: Component, // 展示对应的组件
            modal_title ?: string, // 弹窗标题
            show_way: "modal" | "command" | "gui", // 展示方式
            allow_return?: boolean, // Gui模式下是否允许返回
        }  
    },
    error?: {
        error_message: string; // 报错信息
    }
}