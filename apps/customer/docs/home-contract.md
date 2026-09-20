# Homepage presentation preview

`HomeView` is a working presentation model, not an agreed API schema. Optional `props.draft` supplies the heading,
summary, progress and actions of the draft card. Development previews show the draft by default; `?fixture=clean` shows
the no-draft state. This is a static showcase, not a recovered or persisted case.

Footer `sections` determine order, titles, optional heading, paragraphs, initial expansion and rows. Rows accept a
label, project icon, optional action ID and accent appearance. Actions are gated by `allowedActions` and emitted to the
adapter; no arbitrary HTML is rendered. FAQ labels and contact data reproduce the visual design, not verified
operational contact information. Legal labels are provisional preview content. FAQ/legal actions currently display the
preview notice; document destinations and approved content must come from the server. Draft completion does not close a
real case, and resume only starts the existing fixture flow.
