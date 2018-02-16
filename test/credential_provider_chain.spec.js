// Generated by CoffeeScript 1.12.3
(function() {
  var AWS, helpers;

  helpers = require('./helpers');

  AWS = helpers.AWS;

  if (AWS.util.isNode()) {
    describe('AWS.CredentialProviderChain', function() {
      describe('resolve', function() {
        var chain, defaultProviders;
        chain = null;
        defaultProviders = AWS.CredentialProviderChain.defaultProviders;
        beforeEach(function(done) {
          process.env = {};
          chain = new AWS.CredentialProviderChain([
            function() {
              return new AWS.EnvironmentCredentials('AWS');
            }, function() {
              return new AWS.EnvironmentCredentials('AMAZON');
            }
          ]);
          return done();
        });
        afterEach(function() {
          AWS.CredentialProviderChain.defaultProviders = defaultProviders;
          return process.env = {};
        });
        it('returns an error by default', function() {
          return chain.resolve(function(err) {
            return expect(err.message).to.equal('Variable AMAZON_ACCESS_KEY_ID not set.');
          });
        });
        it('returns AWS-prefixed credentials found in ENV', function() {
          process.env['AWS_ACCESS_KEY_ID'] = 'akid';
          process.env['AWS_SECRET_ACCESS_KEY'] = 'secret';
          process.env['AWS_SESSION_TOKEN'] = 'session';
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('akid');
            expect(creds.secretAccessKey).to.equal('secret');
            return expect(creds.sessionToken).to.equal('session');
          });
        });
        it('returns AMAZON-prefixed credentials found in ENV', function() {
          process.env['AMAZON_ACCESS_KEY_ID'] = 'akid';
          process.env['AMAZON_SECRET_ACCESS_KEY'] = 'secret';
          process.env['AMAZON_SESSION_TOKEN'] = 'session';
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('akid');
            expect(creds.secretAccessKey).to.equal('secret');
            return expect(creds.sessionToken).to.equal('session');
          });
        });
        it('prefers AWS credentials to AMAZON credentials', function() {
          process.env['AWS_ACCESS_KEY_ID'] = 'akid';
          process.env['AWS_SECRET_ACCESS_KEY'] = 'secret';
          process.env['AWS_SESSION_TOKEN'] = 'session';
          process.env['AMAZON_ACCESS_KEY_ID'] = 'akid2';
          process.env['AMAZON_SECRET_ACCESS_KEY'] = 'secret2';
          process.env['AMAZON_SESSION_TOKEN'] = 'session2';
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('akid');
            expect(creds.secretAccessKey).to.equal('secret');
            return expect(creds.sessionToken).to.equal('session');
          });
        });
        it('uses the defaultProviders property on the constructor', function() {
          AWS.CredentialProviderChain.defaultProviders = [];
          process.env['AWS_ACCESS_KEY_ID'] = 'akid';
          process.env['AWS_SECRET_ACCESS_KEY'] = 'secret';
          process.env['AWS_SESSION_TOKEN'] = 'session';
          chain = new AWS.CredentialProviderChain();
          return chain.resolve(function(err) {
            return expect(err.message).to.equal('No providers');
          });
        });
        it('calls resolve on each provider in the chain, stopping for akid', function() {
          var staticCreds;
          staticCreds = {
            accessKeyId: 'abc',
            secretAccessKey: 'xyz'
          };
          chain = new AWS.CredentialProviderChain([staticCreds]);
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('abc');
            expect(creds.secretAccessKey).to.equal('xyz');
            return expect(creds.sessionToken).to.equal(void 0);
          });
        });
        it('accepts providers as functions, evaluating them during resolution', function() {
          var provider;
          provider = function() {
            return {
              accessKeyId: 'abc',
              secretAccessKey: 'xyz'
            };
          };
          chain = new AWS.CredentialProviderChain([provider]);
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('abc');
            expect(creds.secretAccessKey).to.equal('xyz');
            return expect(creds.sessionToken).to.equal(void 0);
          });
        });
        it('prefers static INI credentials over credentials process', function() {
          chain = new AWS.CredentialProviderChain([
            function () { return new AWS.SharedIniFileCredentials(); },
            function () { return new AWS.SharedIniFileCredentials({ useCredentialProcess: true }); },
          ]);

          var mockProcess, mockConfig, creds;
          mockProcess = '{"Version": 1,"AccessKeyId": "xxx","SecretAccessKey": "yyy","SessionToken": "zzz","Expiration": ""}';
          mockConfig = '[default]\ncredential_process=federated_cli_mock\naws_access_key_id = akid\naws_secret_access_key = secret\naws_session_token = session';
          var child_process = require('child_process');
          helpers.spyOn(child_process, 'execSync').andReturn(mockProcess);
          helpers.spyOn(AWS.util, 'readFileSync').andReturn(mockConfig);
          return chain.resolve(function(err, creds) {
            expect(creds.accessKeyId).to.equal('akid');
            expect(creds.secretAccessKey).to.equal('secret');
            return expect(creds.sessionToken).to.equal('session');
          });
         });
         return it('credential_process used when static not present', function() {
           chain = new AWS.CredentialProviderChain([
             function () { return new AWS.SharedIniFileCredentials(); },
             function () { return new AWS.SharedIniFileCredentials({ useCredentialProcess: true }); },
           ]);

           var mockProcess, mockConfig, creds;
           mockProcess = '{"Version": 1,"AccessKeyId": "xxx","SecretAccessKey": "yyy","SessionToken": "zzz","Expiration": ""}';
           mockConfig = '[default]\ncredential_process=federated_cli_mock';
           var child_process = require('child_process');
           helpers.spyOn(child_process, 'execSync').andReturn(mockProcess);
           helpers.spyOn(AWS.util, 'readFileSync').andReturn(mockConfig);
           return chain.resolve(function(err, creds) {
             expect(creds.accessKeyId).to.equal('xxx');
             expect(creds.secretAccessKey).to.equal('yyy');
             return expect(creds.sessionToken).to.equal('zzz');
           });
          });
      });
      if (typeof Promise === 'function') {
        return describe('resolvePromise', function() {
          var catchFunction, chain, creds, err, forceError, mockProvider, ref, thenFunction;
          ref = [], err = ref[0], creds = ref[1], chain = ref[2], forceError = ref[3];
          thenFunction = function(c) {
            return creds = c;
          };
          catchFunction = function(e) {
            return err = e;
          };
          mockProvider = function() {
            var provider;
            provider = new helpers.MockCredentialsProvider();
            if (forceError) {
              provider.forceRefreshError = true;
            }
            return provider;
          };
          before(function() {
            return AWS.config.setPromisesDependency();
          });
          beforeEach(function() {
            err = null;
            creds = null;
            return chain = new AWS.CredentialProviderChain([mockProvider]);
          });
          it('resolves when creds successfully retrieved from a provider in the chain', function() {
            forceError = false;
            return chain.resolvePromise().then(thenFunction)["catch"](catchFunction).then(function() {
              expect(err).to.be["null"];
              expect(creds).to.not.be["null"];
              expect(creds.accessKeyId).to.equal('akid');
              return expect(creds.secretAccessKey).to.equal('secret');
            });
          });
          return it('rejects when all providers in chain return an error', function() {
            forceError = true;
            return chain.resolvePromise().then(thenFunction)["catch"](catchFunction).then(function() {
              expect(err).to.not.be["null"];
              expect(err.code).to.equal('MockCredentialsProviderFailure');
              return expect(creds).to.be["null"];
            });
          });
        });
      }
    });
  }

}).call(this);
