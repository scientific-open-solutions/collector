var editor_grape = grapesjs.init({
    allowScripts: 1,
    container: '#gjs',
    storageManager: false,
    style: '.txt-red{color: red}',
    plugins: ['gjs-blocks-basic'],
    pluginsOpts: {
        'gjs-blocks-basic': {}
    }
});

// Add blocks individually
var blockManager = editor_grape.BlockManager;

blockManager.add('section', {
    label: `<div style="text-align: center;">
                <i class="fa fa-square" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div><b>Section</b></div>
            </div>`,
    attributes: { class: 'gjs-block-section' },
    content: `
        <section>
            <h1>This is a simple title</h1>
            <div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
        </section>`,
});

blockManager.add('text', {
    label: `<div style="text-align: center;">
                <i class="fa fa-font" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div>Text</div>
            </div>`,
    content: '<div data-gjs-type="text">Insert your text here</div>',
});

blockManager.add('image', {
    label: `<div style="text-align: center;">
                <i class="fa fa-image" style="font-size: 36px; margin-bottom: 10px;"></i>
                <div>Image</div>
            </div>`,
    select: true,
    content: { type: 'image' },
    activate: true,
});
