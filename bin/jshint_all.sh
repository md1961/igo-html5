#! /bin/sh

jshint $(find . | grep '\.js$' | grep -v '^\./jasmine/')
