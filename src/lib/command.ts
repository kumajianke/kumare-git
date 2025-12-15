import type { Component, SvelteComponent } from "svelte"
import TaskCreate from "../components/ConsoleChildren/TaskCreate.svelte";

export interface CommandResult {
    modify: {
        command_history_text?: string[], // 对 command_history_text 的修正
        components ?:{
            show_component: Component, // 展示对应的组件
            show_way: "modal" | "command"
        }  
    },
    error?: {
        error_message: string; // 报错信息
    }
}

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

    task_create(){
        return (ctx: any, command_args: string[]) : CommandResult => {
            return {
                modify: {
                    components: {
                        show_component: TaskCreate,
                        show_way: "modal"
                    }
                }
            }
        }
    }
}

export let command = [
    "task-list",
    "task-create",
    "task-update",
    "task-delete",
    "task-detail",
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
    "task-list": "获取所有的任务列表(参数[-u 用户名称] [-s 状态] [-p 项目名称] [-over 是否完成(boolean)])",
    "task-create": "创建一个任务(参数[-n 任务名称] [-p 项目名称] ",
    "task-update": "更新指定任务(参数[-i 任务ID] [-n 新任务名称] [-d 新描述] [-s 新状态] [-p 新项目])",
    "task-delete": "删除指定任务(参数[-i 任务ID])",
    "task-detail": "查看任务详情(参数[-i 任务ID])",
    "project-list": "获取所有项目列表",
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