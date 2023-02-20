default_project = {
  all_procs: {
    "procedure_1.csv": [
      ["item", "code", "max_time", "text", "shuffle_1"],
      [
        "2",
        "instruct",
        "user",
        "This is the start of a new experiment.",
        "off",
      ],
    ],
  },
  conditions: [
    [
      "name",
      "notes",
      "stimuli",
      "procedure",
      "fullscreen",
      "welcome",
      "participant_id",
      "end_message",
      "start_message",
      "buffer",
      // "scripts",
    ],
    [
      "condition_1",
      "You can put more detailed notes in this field",
      "stimuli_1.csv",
      "procedure_1.csv",
      "off",
      "",
      "on",
      "",
      "",
      5,
      "",
    ]
  ],
  all_stims: {
    "stimuli_1.csv": [
      ["cue", "answer"],
      ["A", "Apple"],
      ["B", "Banana"],
    ],
  },
};

default_project.all_procs["procedure_1.csv"] = Papa.unparse(
  default_project.all_procs["procedure_1.csv"]
);

default_project.all_stims["stimuli_1.csv"] = Papa.unparse(
  default_project.all_stims["stimuli_1.csv"]
);
