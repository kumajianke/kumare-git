import type { Component, SvelteComponent } from "svelte"
import TaskCreate from "../components/ConsoleChildren/TaskCreate.svelte";
import type { CommandResult } from "./int/CommandResult";
import TaskGui from "../components/Gui/TaskGui.svelte";



class Command {
    clear() {
        return (ctx: any, command_args: string[]): CommandResult => {
            return {
                modify: {
                    command_history_text: []
                }
            }
        }
    }

    gui_task() {
        console.log("task_gui")
        return (ctx: any, command_args: string[]): CommandResult => {
            return {
                modify: {
                    components: {
                        show_component: TaskGui,
                        show_way: "gui",
                        allow_return: true
                    }
                }
            }
        }
    }

    task_create() {
        return (ctx: any, command_args: string[]): CommandResult => {
            return {
                modify: {
                    components: {
                        show_component: TaskCreate,
                        show_way: "modal",
                        modal_title: "创建任务"
                    }
                }
            }
        }
    }
}

export let command = [
    "task-list",
    "task-create",
    "gui-task",
    "project-list",
    "project-create",
    "project-update",
    "project-delete",
    "project-detail",
    "setting-list",
    "setting-update",
    "help",
    "clear"
]

export let command_doc = {
    "gui_task": "使用界面管理task",

    "task-create": "创建一个任务(参数[-n 任务名称] [-p 项目名称] ",

    "project-create": "创建新项目(参数[-n 项目名称] [-d 项目描述])",
    "project-update": "更新指定项目(参数[-i 项目ID] [-n 新名称] [-d 新描述])",
    "project-delete": "删除指定项目(参数[-i 项目ID])",
    "project-detail": "查看项目详情(参数[-i 项目ID])",
    "setting-list": "列出所有设置项",
    "setting-update": "更新设置项(参数[-k 键] [-v 值])",
    "help": "显示帮助信息",
    "clear": "清空命令历史",
}


export async function getExecuteCommand(command: string) {
    let command_list = command.split(' ');
    let command_name = command_list[0];
    let command_args = command_list.slice(1);

    let command_instance = new Command();
    command_name = command_name.replace("-", "_")
    //@ts-ignore
    let command_func = command_instance[command_name];
    if (command_func === void 0) {
        return () => {
            return {
                error: {
                    error_message: `命令${command_name}不存在`
                }
            }
        }
    }
    return command_func();


}