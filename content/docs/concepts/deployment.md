---
title: Deployment
description: The broker's record that a version of a participant is now running in an environment.
---

A deployment is the broker's record that a version of a participant is now the one running in an environment. You record it after your pipeline has deployed. The version must have been published and the environment must exist.

Each participant has exactly one current version per environment: the most recently recorded one. Recording the version that is already current changes nothing. Recording a version that was current earlier makes it current again; that is how a rollback is recorded, with the same command.

Recording never blocks. The broker takes your word that the deployment happened, whatever a check said; the check is a separate step, and it is your pipeline that decides not to deploy when the check fails.
