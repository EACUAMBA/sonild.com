<?php

namespace App\Policies;

class UserGroupPolicy extends AclPolicy
{
    protected string $resource = 'usergroup';
}
