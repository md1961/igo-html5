DIR_LIB  = lib
DIR_APP  = app
SRC = $(wildcard $(DIR_LIB)/*.js) $(wildcard $(DIR_APP)/*.js) igo.js

JS_ALL_MIN = igo-min.js
INDEX_PROD = index-prod.html
INDEX_DEVEL = index.html

all : $(JS_ALL_MIN) $(INDEX_PROD)

$(JS_ALL_MIN) : $(SRC)
	cat $^ > $@

$(INDEX_PROD) : $(INDEX_DEVEL)
	patch -o $@ < html_productionize.patch
	chmod +r $@

.PHONY: clean
clean :
	rm -f $(JS_ALL_MIN) $(INDEX_PROD) $(INDEX_PROD).rej
