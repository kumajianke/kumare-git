<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade, scale } from 'svelte/transition';

    interface Props {
        show: boolean;
        title?: string;
        children: Snippet;
        onClose?: () => void;
        width?: string;
    }

    let { 
        show = $bindable(false), 
        title = "SYSTEM MESSAGE",
        children,
        onClose,
        width = "500px"
    }: Props = $props();

    function close() {
        show = false;
        if(onClose) onClose();
    }
</script>

{#if show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" transition:fade={{ duration: 200 }} >
        <div 
            class="modal-window" 
            style:width={width}
            transition:scale={{ duration: 300, start: 0.95 }}
            onclick={(e) => e.stopPropagation()}
        >
            <div class="modal-header">
                <div class="header-title">
                    <span class="icon">■</span> {title}
                </div>
                <button class="close-btn" onclick={close}>[X]</button>
            </div>
            
            <div class="scanlines"></div>
            
            <div class="modal-content">
                {@render children()}
            </div>
            
            <div class="modal-footer-decoration">
                <div class="status-bar">
                    <span>STATUS: ACTIVE</span>
                    <span>MEM: OK</span>
                </div>
            </div>
        </div>
    </div>
{/if}

<style lang="less">
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-window {
        background: #0a0a0a;
        border: 2px solid #333;
        box-shadow: 0 0 30px rgba(0, 255, 0, 0.1);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 90vh;
        
        // CRT Glow Effect
        &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 1px solid #00ff00;
            opacity: 0.3;
            pointer-events: none;
            z-index: 10;
        }
    }

    .modal-header {
        background: #003300;
        color: #00ff00;
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #00ff00;
        font-family: "像素", monospace;
        user-select: none;
        
        .header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            
            .icon {
                font-size: 0.8em;
                animation: blink 2s infinite;
            }
        }
        
        .close-btn {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: inherit;
            font-weight: bold;
            transition: all 0.2s;
            
            &:hover {
                color: #fff;
                text-shadow: 0 0 5px #fff;
            }
        }
    }

    .modal-content {
        padding: 20px;
        color: #ccc;
        font-family: "Consolas", "Courier New", monospace;
        overflow-y: auto;
        position: relative;
        z-index: 5;
    }

    .modal-footer-decoration {
        background: #050505;
        border-top: 1px solid #333;
        padding: 5px 15px;
        
        .status-bar {
            display: flex;
            justify-content: space-between;
            font-family: "像素", monospace;
            font-size: 0.7rem;
            color: #444;
        }
    }

    .scanlines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0) 50%,
            rgba(0, 0, 0, 0.2) 50%,
            rgba(0, 0, 0, 0.2)
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 2;
        opacity: 0.3;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
</style>