@extends('Layout.app')
@section('title', 'Create & design — Quotiq')
@section('content')
    <div class="preview-shell">
        <div class="workspace-tabs" role="tablist" aria-label="Creative tools">
            <button id="tab-draw" role="tab" aria-controls="panel-draw" aria-selected="true"
                data-panel="draw"><span class="step-number">1</span> Create your quote</button>
            <button id="tab-studio" role="tab" aria-controls="panel-studio" aria-selected="false"
                data-panel="studio"><span class="step-number">2</span> Design your card</button>
        </div>
        <section id="panel-draw" role="tabpanel" aria-labelledby="tab-draw" class="workspace-panel">
            <div class="workspace-grid">
                <div class="workspace-controls">
                    <h2>What’s on your mind?</h2>
                    <label class="control-label" for="post-text">Your quote
                        <span>Optional with a drawing</span>
                    </label>
                    <textarea id="post-text" rows="5" maxlength="155"
                        placeholder="A few words, a little feeling…">
</textarea>
                    <p class="field-hint"><span id="post-characters">0</span> / 155 · Text must be at
                        least 3
                        characters when included.</p>
                    <button class="button button-outline" id="open-drawing">
                        <x-icon name="pen" /><span>Add a
                            drawing</span>
                    </button>
                    <button class="button button-outline" id="continue-to-studio">Design card <x-icon
                            name="arrow" />
                    </button>
                    <button class="button button-primary" id="publish-preview">Publish quote <x-icon
                            name="arrow" />
                    </button>
                    <p id="publish-status" role="status" class="workspace-status">
                    </p>
                </div>
                <div class="drawing-space">
                    <div id="drawing-placeholder" class="drawing-placeholder">
                    </div>
                    <div id="drawing-editor" hidden>
                        <div class="drawing-toolbar" role="toolbar" aria-label="Drawing tools">
                            <button id="tool-pen" class="tool-button active" aria-pressed="true"
                                aria-label="Pencil">
                                <x-icon name="pen" /><span>Pencil</span>
                            </button>
                            <button id="tool-eraser" class="tool-button" aria-pressed="false"
                                aria-label="Eraser">
                                <x-icon name="eraser" /><span>Eraser</span>
                            </button>
                            <label class="color-control" title="Pencil color"><span
                                    class="sr-only">Pencil
                                    color</span>
                                <input id="pen-color" type="color" value="#151515">
                            </label>
                            <label class="brush-control">Size <input id="pen-size" type="range"
                                    min="2" max="30" value="5">
                            </label>
                            <button id="draw-undo" class="tool-button" aria-label="Undo drawing"
                                disabled>↶ Undo</button>
                            <button id="draw-redo" class="tool-button" aria-label="Redo drawing"
                                disabled>↷
                                Redo</button>
                            <button id="draw-clear" class="tool-button">Clear</button>
                        </div>
                        <canvas id="drawing-canvas" tabindex="0" width="800" height="500"
                            aria-label="Freehand drawing canvas">
                        </canvas>
                        <div class="drawing-footer"><span>Draw with your mouse, finger, or
                                pen.</span>
                            <button id="draw-done" class="text-button">Use drawing
                                ✓</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="panel-studio" role="tabpanel" aria-labelledby="tab-studio" class="workspace-panel"
            hidden>
            <div class="workspace-grid studio-grid">
                <div class="workspace-controls">
                    <input id="studio-source" type="hidden" value="custom">
                    <textarea id="studio-text" hidden>
</textarea>
                    <input id="studio-author" type="hidden" value="Your name">
                    <input id="studio-background" type="hidden" value="#F5F2ED">
                    <input id="studio-include-drawing" type="checkbox" checked hidden>
                    <fieldset class="template-picker">
                        <legend class="control-label">Templates</legend>
                        <div class="template-grid">
                            @foreach (['botanical' => 'Golden stars', 'frame' => 'Golden sun', 'garden' => 'Pearl bubbles', 'ribbon' => 'Rose hearts', 'arch' => 'Silk bow', 'check' => 'Wildflowers'] as $key => $label)
                                <button class="template-option" data-template="{{ $key }}"
                                    aria-pressed="{{ $loop->first ? 'true' : 'false' }}">
                                    <canvas width="140" height="168" aria-hidden="true">
                                    </canvas><span>{{ $label }}</span>
                                </button>
                            @endforeach
                        </div>
                    </fieldset>
                    <fieldset class="template-picker">
                        <legend class="control-label">Simple colors</legend>
                        <div class="template-grid">
                            @foreach (['plain-ivory' => 'Ivory', 'plain-green' => 'Green', 'plain-red' => 'Red', 'plain-orange' => 'Orange', 'plain-black' => 'Black'] as $key => $label)
                                <button class="template-option" data-template="{{ $key }}"
                                    aria-pressed="false">
                                    <canvas width="140" height="168" aria-hidden="true">
                                    </canvas><span>{{ $label }}</span>
                                </button>
                            @endforeach
                        </div>
                    </fieldset>
                    <label class="control-label font-color-control" for="studio-color">Font
                        color<input id="studio-color" type="color" value="#493b31">
                    </label>
                    <label class="control-label" for="studio-font">Font</label>
                    <select id="studio-font">
                        <option value="Georgia">Classic serif</option>
                        <option value="Arial">Clean sans</option>
                        <option value="Courier New">Typewriter</option>
                    </select>
                    <label class="control-label" for="studio-size">Text size <output
                            id="size-output">64</output>
                    </label>
                    <input id="studio-size" type="range" min="32" max="80"
                        value="64">
                    <select id="studio-position" hidden aria-hidden="true">
                        <option value="top">Top</option>
                        <option value="middle" selected>Middle</option>
                        <option value="bottom">Bottom</option>
                    </select>
                    <fieldset class="layer-controls" id="text-layout-controls">
                        <legend class="control-label">Text position</legend>
                        <label for="text-x">Left / right</label>
                        <input id="text-x" type="range" min="0" max="100" value="50">
                        <label for="text-y">Up / down</label>
                        <input id="text-y" type="range" min="0" max="100" value="35">
                    </fieldset>
                    <fieldset class="layer-controls" id="drawing-layout-controls" hidden>
                        <legend class="control-label">Drawing</legend>
                        <label for="drawing-x">Left / right</label>
                        <input id="drawing-x" type="range" min="0" max="100" value="50">
                        <label for="drawing-y">Up / down</label>
                        <input id="drawing-y" type="range" min="0" max="100" value="72">
                        <label for="drawing-scale">Size</label>
                        <input id="drawing-scale" type="range" min="25" max="100" value="65">
                    </fieldset>
                    <div class="studio-buttons">
                        <button id="studio-reset" class="button button-outline">Reset</button>
                        <button id="studio-download" class="button button-primary">
                            <x-icon name="download" /> Download
                            PNG</button>
                    </div>
                    <button class="button button-primary" id="publish-card">Publish card <x-icon
                            name="arrow" />
                    </button>
                    <p id="studio-status" class="workspace-status" role="status">
                    </p>
                </div>
                <div class="studio-preview">
                    <canvas id="card-canvas" width="1000" height="1200"
                        aria-label="Live quote card preview">
                    </canvas>
                </div>
            </div>
        </section>
    </div>
    <a href="#draw" class="create-quote-fab" aria-label="Create a quote">+</a>
    @vite('resources/js/preview.js')
@endsection
