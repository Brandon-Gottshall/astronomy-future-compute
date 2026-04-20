#!/usr/bin/env ruby
# frozen_string_literal: true

require "yaml"

ROOT = File.expand_path("..", __dir__)
SOURCE = File.join(ROOT, "content", "copy.yaml")
TARGET = File.join(ROOT, "content", "copy.editor.md")

data = YAML.load_file(SOURCE)

def dig!(hash, *path)
  path.reduce(hash) do |memo, key|
    value = memo[key]
    raise KeyError, "Missing path: #{path.join('.')}" if value.nil?

    value
  end
end

def emit(lines, text = "")
  lines << text
end

def emit_heading(lines, level, text)
  emit(lines, "#{"#" * level} #{text}")
  emit(lines)
end

def emit_bundle(lines, key)
  emit(lines, "[[#{key}]]")
  yield(lines)
  emit(lines, "[[/#{key}]]")
  emit(lines)
end

def emit_label(lines, label, value)
  case value
  when Array
    emit(lines, "#{label}:")
    value.each { |item| emit(lines, "- #{item}") }
  else
    emit(lines, "#{label}: #{value}")
  end
end

def emit_paragraph(lines, label, value)
  emit(lines, "#{label}:")
  emit(lines, value.to_s.strip)
  emit(lines)
end

out = []

emit_heading(out, 1, "Copy Editing Draft")
emit(out, "This file is organized for editing, not rendering.")
emit(out, "Keep the `[[...]]` bundle markers and the field labels unchanged so the prose can be mapped back into `content/copy.yaml` later.")
emit(out)

meta = dig!(data, "meta")
emit_heading(out, 2, "Meta And Global UI")
emit_bundle(out, "meta") do |lines|
  emit_label(lines, "Title", meta["title"])
  emit_label(lines, "Subtitle", meta["subtitle"])
  emit_label(lines, "Course", meta["course"])
  emit_label(lines, "Authors", meta["authors"])
  emit_label(lines, "Date", meta["date"])
  emit_label(lines, "Student Name", meta["studentName"])
  emit_label(lines, "Assignment", meta["assignment"])
  emit_label(lines, "Institution Context", meta["institutionContext"])
  emit_label(lines, "Prepared For", meta["preparedFor"])
end

emit_bundle(out, "atlasSections") do |lines|
  dig!(data, "atlasSections").each_with_index do |section, index|
    emit(lines, "Section #{index + 1} Title: #{section['title']}")
    emit(lines, "Section #{index + 1} Nav: #{section['nav']}")
  end
end

emit_bundle(out, "liveSections") do |lines|
  dig!(data, "liveSections").each_with_index do |section, index|
    emit(lines, "Section #{index + 1} Title: #{section['title']}")
    emit(lines, "Section #{index + 1} Nav: #{section['nav']}")
  end
end

emit_bundle(out, "referenceTypeLabels") do |lines|
  labels = dig!(data, "referenceTypeLabels")
  emit_label(lines, "Official", labels["official"])
  emit_label(lines, "Academic", labels["academic"])
  emit_label(lines, "Journalism", labels["journalism"])
  emit_label(lines, "Industry", labels["industry"])
  emit_label(lines, "Uploaded", labels["uploaded"])
  emit_label(lines, "Rubric", labels["rubric"])
end

emit_bundle(out, "common") do |lines|
  common = dig!(data, "common")
  emit_label(lines, "Open Research Atlas", common["openResearchAtlas"])
  emit_label(lines, "Open Presentation Mode", common["openPresentationMode"])
  emit_label(lines, "Link Label", common["linkLabel"])
  emit_label(lines, "Local Label", common["localLabel"])
  emit_label(lines, "Footer", common["footer"])
  emit_label(lines, "Presentation Mode", common["presentationMode"])
  emit_label(lines, "Appendix Banner Main", common["appendixBannerMain"])
  emit_label(lines, "Appendix Banner Back", common["appendixBannerBack"])
end

emit_heading(out, 2, "Data Copy")

dig!(data, "dataCopy", "pathways").each do |pathway, details|
  emit_bundle(out, "dataCopy.pathways.#{pathway}") do |lines|
    emit_paragraph(lines, "Description", details["description"])
    emit_label(lines, "Strongest Upside", details["strongestUpside"])
    emit_label(lines, "Strongest Downside", details["strongestDownside"])
    emit_label(lines, "Astronomy Risk", details["astronomyRisk"])
  end
end

dig!(data, "dataCopy", "scenarios").each_with_index do |scenario, index|
  emit_bundle(out, "dataCopy.scenarios.#{index}") do |lines|
    emit_label(lines, "Label", scenario["label"])
    emit_label(lines, "Winner", scenario["winner"])
    emit_paragraph(lines, "Why", scenario["why"])
  end
end

emit_bundle(out, "dataCopy.externalities") do |lines|
  dig!(data, "dataCopy", "externalities").each_with_index do |item, index|
    emit(lines, "Item #{index + 1}: #{item['label']}")
  end
end

dig!(data, "dataCopy", "counterArena").each do |pathway, details|
  emit_bundle(out, "dataCopy.counterArena.#{pathway}") do |lines|
    emit_label(lines, "Objections", details["objections"])
    emit_label(lines, "Conclusions That Remain Robust", details["survives"])
  end
end

dig!(data, "dataCopy", "recommendations").each_with_index do |item, index|
  emit_bundle(out, "dataCopy.recommendations.#{index}") do |lines|
    emit_label(lines, "Title", item["title"])
    emit_paragraph(lines, "Body", item["body"])
    emit_label(lines, "Icon", item["icon"])
  end
end

dig!(data, "dataCopy", "externalityNotes").each do |pathway, notes|
  emit_bundle(out, "dataCopy.externalityNotes.#{pathway}") do |lines|
    notes.each do |note_key, note_text|
      emit_paragraph(lines, note_key, note_text)
    end
  end
end

emit_heading(out, 2, "Atlas Flow")

atlas = dig!(data, "atlas")
emit_bundle(out, "atlas.problem") do |lines|
  section = atlas["problem"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_paragraph(lines, "Body", section["body"])
  emit_label(lines, "Chart Title", section["chartTitle"])
  emit_label(lines, "Timeline Title", section["timelineTitle"])
  emit_label(lines, "Year Label", section["yearLabel"])
  emit_label(lines, "Timeline Pathway Label", section["timelinePathwayLabel"])
  emit_label(lines, "Timeline Options", section["timelineOptions"].map { |item| item["label"] })
  emit_label(lines, "Timeline Empty", section["timelineEmpty"])
end

emit_bundle(out, "atlas.pathways") do |lines|
  section = atlas["pathways"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Upside Label", section["upsideLabel"])
  emit_label(lines, "Downside Label", section["downsideLabel"])
  emit_label(lines, "Astronomy Risk Label", section["astronomyRiskLabel"])
  emit_label(lines, "Scenario Title", section["scenarioTitle"])
  emit_label(lines, "Scenario Result Label", section["scenarioResultLabel"])
  emit_label(lines, "Relocation Title", section["relocationTitle"])
  emit_label(lines, "Relocation Pathway Label", section["relocationPathwayLabel"])
  emit_label(lines, "Relocation Options", section["relocationOptions"].map { |item| item["label"] })
end

emit_bundle(out, "atlas.astronomy") do |lines|
  section = atlas["astronomy"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_paragraph(lines, "Quote", section["quote"])
  emit_label(lines, "Optical Title", section["opticalTitle"])
  emit_paragraph(lines, "Optical Body", section["opticalBody"])
  emit_label(lines, "Radio Title", section["radioTitle"])
  emit_paragraph(lines, "Radio Body", section["radioBody"])
  emit_label(lines, "Debris Title", section["debrisTitle"])
  emit_paragraph(lines, "Debris Body", section["debrisBody"])
  emit_label(lines, "Chart Title", section["chartTitle"])
  emit_paragraph(lines, "Note", section["note"])
end

emit_bundle(out, "atlas.objections") do |lines|
  section = atlas["objections"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Pathway Label", section["pathwayLabel"])
  emit_label(lines, "Pathway Options", section["pathwayOptions"].map { |item| item["label"] })
  emit_label(lines, "Objections Heading", section["objectionsHeading"])
  emit_label(lines, "Robust Heading", section["robustHeading"])
end

emit_bundle(out, "atlas.conclusions") do |lines|
  section = atlas["conclusions"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Scan Prompt", section["scanPrompt"])
end

emit_bundle(out, "atlas.references") do |lines|
  emit_label(lines, "Title", atlas["references"]["title"])
end

emit_heading(out, 2, "Live Flow")

live = dig!(data, "live")
emit_bundle(out, "live.hero") do |lines|
  section = live["hero"]
  emit_label(lines, "Eyebrow", section["eyebrow"])
  emit_label(lines, "Title", section["title"])
  emit_label(lines, "Subtitle", section["subtitle"])
  emit_paragraph(lines, "Dek", section["dek"])
  emit_label(lines, "Primary CTA", section["primaryCta"])
  emit_label(lines, "Secondary CTA", section["secondaryCta"])
  section["cards"].each_with_index do |card, index|
    emit(lines, "Card #{index + 1} Title: #{card['title']}")
    emit(lines, "Card #{index + 1} Body: #{card['body']}")
  end
end

emit_bundle(out, "live.need") do |lines|
  section = live["need"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  section["cards"].each_with_index do |card, index|
    emit(lines, "Card #{index + 1} Title: #{card['title']}")
    emit(lines, "Card #{index + 1} Body: #{card['body']}")
  end
end

emit_bundle(out, "live.context") do |lines|
  section = live["context"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Baseline Title", section["baselineTitle"])
  emit_label(lines, "Astronomy Card Title", section["astronomyCardTitle"])
  emit_paragraph(lines, "Astronomy Card Body", section["astronomyCardBody"])
  emit_label(lines, "Comparison Card Title", section["comparisonCardTitle"])
  emit_paragraph(lines, "Comparison Card Body", section["comparisonCardBody"])
end

emit_bundle(out, "live.bridge") do |lines|
  section = live["bridge"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  section["steps"].each_with_index do |step, index|
    emit(lines, "Step #{index + 1} Label: #{step['label']}")
    emit(lines, "Step #{index + 1} Body: #{step['body']}")
  end
end

emit_bundle(out, "live.responses") do |lines|
  section = live["responses"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Best Case Label", section["bestCaseLabel"])
  emit_label(lines, "Main Constraint Label", section["mainConstraintLabel"])
  emit_label(lines, "Table Header", section["tableHeader"])
  emit_paragraph(lines, "Note", section["note"])
  section["rows"].each_with_index do |row, index|
    emit(lines, "Row #{index + 1} Label: #{row['label']}")
    emit(lines, "Row #{index + 1} Land: #{row['land']}")
    emit(lines, "Row #{index + 1} Underwater: #{row['underwater']}")
    emit(lines, "Row #{index + 1} Orbital: #{row['orbital']}")
  end
end

emit_bundle(out, "live.underwater") do |lines|
  section = live["underwater"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Pros Title", section["prosTitle"])
  emit_label(lines, "Limits Title", section["limitsTitle"])
  emit_label(lines, "Pros", section["pros"])
  emit_label(lines, "Limits", section["limits"])
  emit_label(lines, "Astronomy Title", section["astronomyTitle"])
  emit_paragraph(lines, "Astronomy Body", section["astronomyBody"])
end

emit_bundle(out, "live.orbital") do |lines|
  section = live["orbital"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Pros Title", section["prosTitle"])
  emit_label(lines, "Limits Title", section["limitsTitle"])
  emit_label(lines, "Pros", section["pros"])
  emit_label(lines, "Limits", section["limits"])
  emit_label(lines, "Chart Title", section["chartTitle"])
  emit_label(lines, "Card One Title", section["cardOneTitle"])
  emit_paragraph(lines, "Card One Body", section["cardOneBody"])
  emit_label(lines, "Card Two Title", section["cardTwoTitle"])
  emit_paragraph(lines, "Card Two Body", section["cardTwoBody"])
end

emit_bundle(out, "live.conclusion") do |lines|
  section = live["conclusion"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Bullets", section["bullets"])
  emit_label(lines, "Best Fit Title", section["bestFitTitle"])
  emit_paragraph(lines, "Best Fit Body", section["bestFitBody"])
  emit_label(lines, "Atlas Title", section["atlasTitle"])
  emit_paragraph(lines, "Atlas Body", section["atlasBody"])
end

emit_bundle(out, "live.references") do |lines|
  section = live["references"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_paragraph(lines, "Footer", section["footer"])
end

emit_heading(out, 2, "Rubric Flow")

rubric = dig!(data, "rubric")
emit_bundle(out, "rubric.studentHeader") do |lines|
  section = rubric["studentHeader"]
  emit_label(lines, "Title", section["title"])
  emit_label(lines, "Subtitle", section["subtitle"])
  emit_label(lines, "Authors Label", section["authorsLabel"])
  emit_label(lines, "Class Label", section["classLabel"])
  emit_label(lines, "Assignment Label", section["assignmentLabel"])
  emit_label(lines, "Date Label", section["dateLabel"])
end

emit_bundle(out, "rubric.publicEmptyBanner") do |lines|
  emit_paragraph(lines, "Body", rubric["publicEmptyBanner"])
end

%w[topicSummary astronomyRelevance futureImpact recommendation].each do |section_key|
  emit_bundle(out, "rubric.#{section_key}") do |lines|
    section = rubric[section_key]
    emit_label(lines, "Title", section["title"])
    emit_label(lines, "Tag", section["tag"])
    emit_paragraph(lines, "Body", section["body"])
    emit_paragraph(lines, "Author Prompt", section["authorPrompt"])
  end
end

emit_bundle(out, "rubric.milestones") do |lines|
  section = rubric["milestones"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  section["items"].each_with_index do |item, index|
    emit(lines, "Milestone #{index + 1} Year: #{item['year']}")
    emit(lines, "Milestone #{index + 1} Label: #{item['label']}")
  end
end

emit_bundle(out, "rubric.comparisonMatrix") do |lines|
  section = rubric["comparisonMatrix"]
  emit_label(lines, "Title", section["title"])
  emit_paragraph(lines, "Intro", section["intro"])
  emit_label(lines, "Axis Header", section["axisHeader"])
  emit_label(lines, "Columns", section["columns"])
  section["rows"].each_with_index do |row, index|
    emit(lines, "Row #{index + 1} Axis: #{row['axis']}")
    emit(lines, "Row #{index + 1} Land: #{row['land']}")
    emit(lines, "Row #{index + 1} Underwater: #{row['underwater']}")
    emit(lines, "Row #{index + 1} Orbital: #{row['orbital']}")
  end
end

emit_heading(out, 2, "Speakers")
emit_bundle(out, "speakers") do |lines|
  dig!(data, "speakers").each_with_index do |speaker, index|
    emit(lines, "Speaker #{index + 1} Id: #{speaker['id']}")
    emit(lines, "Speaker #{index + 1} Name: #{speaker['name']}")
    emit(lines, "Speaker #{index + 1} Role: #{speaker['role']}")
  end
end

emit_heading(out, 2, "Slides")
dig!(data, "slides").each_with_index do |slide, index|
  emit_bundle(out, "slides.#{index}") do |lines|
    emit_label(lines, "Id", slide["id"])
    emit_label(lines, "Section", slide["section"])
    emit_label(lines, "Speaker", slide["speaker"])
    emit_label(lines, "Visual", slide["visual"] || "none")
    emit_label(lines, "Title", slide["title"])
    emit_paragraph(lines, "Body", slide["body"])
    (slide["notes"] || {}).each do |speaker_id, text|
      emit_paragraph(lines, "Notes (#{speaker_id})", text.to_s)
    end
  end
end

File.write(TARGET, out.join("\n"))
puts "Wrote #{TARGET}"
