#! /bin/env ruby

BEGIN_JASMINE_FILES_WHEN_DISABLED = "<!-- Jasmine files"           .freeze
  END_JASMINE_FILES_WHEN_DISABLED = "End of Jasmine files -->"     .freeze
BEGIN_JASMINE_FILES_WHEN_ENABLED  = "<!-- Jasmine files -->"       .freeze
  END_JASMINE_FILES_WHEN_ENABLED  = "<!-- End of Jasmine files -->".freeze

RE_DIV_APPLICATION = /<div id="application"( hidden)?>[ \t]*$/.freeze
DIV_APPLICATION_DISABLED = '<div id="application">'       .freeze
DIV_APPLICATION_ENABLED  = '<div id="application" hidden>'.freeze

COLOR_RED   = "\e[31m"
COLOR_BLUE  = "\e[36m"
COLOR_RESET = "\e[0m"


TARGET_FILE = 'index.html'.freeze

unless File.exist?(TARGET_FILE)
  STDERR.puts "Cannot find file '#{TARGET_FILE}'"
  exit
end


contents = File.binread(TARGET_FILE)

re_begin_jasmine_disabled = /#{Regexp.escape(BEGIN_JASMINE_FILES_WHEN_DISABLED)}[ \t]*$/
will_enable = contents =~ re_begin_jasmine_disabled

unless m = contents.match(RE_DIV_APPLICATION)
  STDERR.puts %Q(Cannot locate '<div id="application">' in file '#{TARGET_FILE}')
  exit
end

if (will_enable && m[1] == ' hidden') || (!will_enable && m[1].nil?)
  STDERR.puts %Q(Quit due to conflicts between Jasmine files commenting and visibility of <div id="application">)
  exit
end


if ARGV.length >= 1
  status, color = will_enable ? ['disabled', COLOR_RED] : ['enabled', COLOR_BLUE]
  puts "#{color}Jasmine is #{status}#{COLOR_RESET}"
  exit
end


if will_enable
  re_begin_jasmine = re_begin_jasmine_disabled
  re_end_jasmine = /#{Regexp.escape(END_JASMINE_FILES_WHEN_DISABLED)}[ \t]*$/

  contents.sub!(re_begin_jasmine, BEGIN_JASMINE_FILES_WHEN_ENABLED)
  contents.sub!(re_end_jasmine  ,   END_JASMINE_FILES_WHEN_ENABLED)
  contents.sub!(RE_DIV_APPLICATION,        DIV_APPLICATION_ENABLED)
else
  re_begin_jasmine = /#{Regexp.escape(BEGIN_JASMINE_FILES_WHEN_ENABLED)}[ \t]*$/
  re_end_jasmine   = /#{Regexp.escape(  END_JASMINE_FILES_WHEN_ENABLED)}[ \t]*$/

  contents.sub!(re_begin_jasmine, BEGIN_JASMINE_FILES_WHEN_DISABLED)
  contents.sub!(re_end_jasmine  ,   END_JASMINE_FILES_WHEN_DISABLED)
  contents.sub!(RE_DIV_APPLICATION,        DIV_APPLICATION_DISABLED)
end


File.write(TARGET_FILE, contents)

status, color = will_enable ? ['enabled', COLOR_BLUE] : ['disabled', COLOR_RED]
puts "#{color}Jasmine has been #{status}#{COLOR_RESET}"

