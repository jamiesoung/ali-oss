
3.1.3 / 2015-12-18
==================

  * fix(object): custom content-type support lower case
  * deps: update dependencies

3.1.2 / 2015-10-26
==================

  * feat: support custom Content-Type

3.1.1 / 2015-10-23
==================

 * fix(cluster): simplify cluster config

3.1.0 / 2015-10-23
==================

 * feat: support custom urllib client
 * chore: add node required on package.json

3.0.3 / 2015-10-03
==================

  * feat: change check status file path

3.0.2 / 2015-10-01
==================

  * feat: make chooseAvailable public

3.0.1 / 2015-09-30
==================

  * deps: urllib@2.5.0

3.0.0 / 2015-09-30
==================

  * refactor: change signatureUrl to normal function
  * feat: add available checking

2.8.0 / 2015-09-29
==================

 * test: cluster store to two different bucket
 * feat: support signatureUrl
 * feat: add clusterClient

2.7.0 / 2015-09-22
==================

 * feat: support cname and object url

2.6.1 / 2015-09-09
==================

 * add endpoint into readme
 * chore: fix codecov link

2.6.0 / 2015-09-07
==================

 * test: skip image upload
 * docs: add putStream doc
 * test: use codecov
 * feat: put object support streaming

2.5.1 / 2015-08-24
==================

 * fix: remove unnecessary decode
 * fix: signature url
 * fix: escape resource

2.5.0 / 2015-08-22
==================

 * chore: travis use sudo: false
 * feat: request error add params info

2.4.0 / 2015-08-15
==================

  * feat(createRequest): expose create request method
  * deps upgrade

2.3.0 / 2015-07-25
==================

 * feature: support custom agent by options.agent

2.2.0 / 2015-04-02
==================

 * Image service API (@zensh)

2.1.0 / 2015-03-23
==================

 * feat: add getStream*() api

2.0.0 / 2015-02-28
==================

  * fix get not exists object TypeError
  * transfer to ali-sdk/ali-oss
  * feat(object): support streaming put
  * refactor object operations with successStatuses and xmpResponse
  * finish bucket operations
  * ensure tmp dir exists
  * add appveyor.yml
  * add bucket operations
  * support deleteMulti
  * support copy and updateMeta
  * support get object
  * support delete object
  * totally refactor according to ali-sdk

1.1.0 / 2015-01-30
==================

 * feat: support signature url

1.0.0 / 2014-10-26
==================

  * use urllib replace of co-urllib
  * fix readme
  * ocd
  * update examples

0.0.3 / 2014-04-11
==================

  * update co-urllib, add mime, add alias

0.0.2 / 2014-04-10
==================

  * fix 404 error handler
  * Merge branch 'master' of github.com:node-modules/ali-oss
  * add istanbul
  * Merge pull request #1 from chunpu/patch-1
  * fix regenerator url

0.0.1 / 2014-04-08
==================

  * fix readme
  * add travis-ci
  * use renegerator
  * update readme
  * add callback example
  * add test
  * finish get and remove
  * complete upload
  * Initial commit
